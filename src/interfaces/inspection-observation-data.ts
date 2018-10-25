export interface InspectionObservationData {
  id: string;
  identifier: string;
  location: string;
  findings?: string[];
  recommendation?: string[];
  photos?: string[];
}