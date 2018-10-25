export interface InspectionDatasheet {
  id: string;
  asset: string;
  field: string;
  inspection_timestamp: number;
  critical_rating: string;
  circuit_id: string;
  line_no: string;
  insulated: string;
  metal_temp: number;
  operating_pressure: number;
  operating_temperature: number;
  dead_legs: number;
  long_horizontal_runs: number;
  erosion_zones: number;
  elbows: number;
  tees: number;
  reducers: number;
  nominal_thickness: number;
  thickness_min: number;
  thickness_max: number;
  external_metal_loss_length: number;
  external_metal_loss_width: number;
  external_metal_loss_depth: number;
  dft: string;
}