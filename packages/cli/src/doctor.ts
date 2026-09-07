export type DoctorStatus = 'pass' | 'warning' | 'fail';

export interface DoctorCheck {
    label: string;
    status: DoctorStatus;
    detail: string;
}

export interface DoctorReport {
    checks: DoctorCheck[];
    healthy: boolean;
}
