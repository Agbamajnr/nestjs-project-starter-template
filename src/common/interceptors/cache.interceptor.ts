import {
    Injectable,
    ExecutionContext,
    CallHandler,
    Logger,
    Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

interface AuthenticatedRequest {
    user?: {
        id: string;
        email: string;
        role?: string;
    };
    method: string;
    path: string;
    url: string;
    query?: any;
    params?: any;
}

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
    private readonly logger = new Logger(CustomCacheInterceptor.name);
    private readonly maxTtl = 60; // Maximum TTL in seconds
    private readonly environment = process.env.NODE_ENV || 'development';

    constructor(
        @Inject(CACHE_MANAGER) cacheManager: Cache,
        reflector: Reflector,
    ) {
        super(cacheManager, reflector);
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        // Skip caching for auth routes
        if (this.shouldSkipCache(request)) {
            return next.handle();
        }

        // Use the default caching behavior but with TTL control
        const result = await super.intercept(context, next);
        return result.pipe(
            tap(async () => {
                // Ensure TTL doesn't exceed maximum limit
                await this.enforceTtlLimit(context);
            })
        );
    }

    /**
     * Override the trackBy method to include environment and user-specific cache keys
     * This ensures that cached data is environment-specific and user-specific
     */
    protected trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        // Get the default cache key from the parent class
        const defaultKey = super.trackBy(context);

        // Create environment-specific cache key
        let environmentKey = `${this.environment}:${defaultKey}`;

        // If user is authenticated, add user-specific key
        if (request.user && request.user.id) {
            const userId = request.user.id;
            environmentKey = `${environmentKey}:user:${userId}`;
        }

        this.logger.debug(`Generated environment-aware cache key: ${environmentKey}`);

        return environmentKey;
    }

    /**
     * Enforce TTL limit for cached entries
     */
    private async enforceTtlLimit(context: ExecutionContext): Promise<void> {
        const cacheKey = this.trackBy(context);
        if (!cacheKey) return;

        try {
            // Get the cache manager instance
            const cacheManager = (this as any).cacheManager as Cache;

            // Check if the key exists and reset with max TTL if needed
            const cachedValue = await cacheManager.get(cacheKey);
            if (cachedValue !== undefined) {
                // Re-set with enforced TTL limit
                await cacheManager.set(cacheKey, cachedValue, this.maxTtl * 1000); // Convert to milliseconds
                this.logger.debug(`Enforced TTL limit of ${this.maxTtl}s for cache key: ${cacheKey}`);
            }
        } catch (error) {
            this.logger.warn(`Failed to enforce TTL limit for cache key ${cacheKey}:`, error);
        }
    }

    private shouldSkipCache(request: AuthenticatedRequest): boolean {
        const skipPaths = [
            '/authentication/login',
            '/authentication/register',
            '/authentication/refresh',
            '/authentication/logout',
            'undefined',
        ];

        // Skip caching for all POST, PUT, DELETE, PATCH methods (write operations)
        // and specific auth-related paths
        const skipMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

        return (
            skipPaths.some((path) => request.path.includes(path)) ||
            skipMethods.includes(request.method) ||
            process.env.NODE_ENV === 'test'
        );
    }
}
