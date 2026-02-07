import { ConfigService } from '@nestjs/config';
export interface WorkoutData {
    date: string;
    exercise: string;
    muscleGroup: string;
    sets: number;
    reps: number;
    weight: number;
    comment: string;
}
export interface NoteData {
    date: string;
    time: string;
    note: string;
}
export declare class GoogleSheetsService {
    private configService;
    private readonly logger;
    private sheets;
    private readonly spreadsheetId;
    constructor(configService: ConfigService);
    private initializeClient;
    appendWorkout(data: WorkoutData): Promise<void>;
    appendNote(data: NoteData): Promise<void>;
}
