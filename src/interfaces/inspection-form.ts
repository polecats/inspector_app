import { InspectionDatasheet } from "./inspection-datasheet";
import { InspectionObservation } from "./inspection-observation";
import { InspectionDiagram } from "./inspection-drawing";

// Optional Properties are denote as ?

export interface InspectionForm {
  id: string;
  name: string;
  datasheet: InspectionDatasheet;
  observation?: InspectionObservation;
  drawings?: InspectionDiagram;
  timestamp: number;
}