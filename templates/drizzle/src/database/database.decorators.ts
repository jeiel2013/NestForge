import { Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE } from './database.constants';

export const InjectDatabase = () =>
    Inject(DRIZZLE_DATABASE);