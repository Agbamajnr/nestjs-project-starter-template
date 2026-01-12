import { Logger } from "@nestjs/common";

export const logger = (name: string = 'MAIN_BACKEND') => {
    return new Logger(name);
}