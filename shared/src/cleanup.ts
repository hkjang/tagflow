export interface CleanupLog {
  id: number;
  admin_id: number;
  deleted_count: number;
  run_time: Date;
}

export interface CleanupFailLog {
  id: number;
  admin_id: number;
  error_message: string;
  run_time: Date;
}
