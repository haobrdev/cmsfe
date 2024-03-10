import { uploadFileLane } from './uploadFileLane';
import {EquipmentDetail}  from "./EquipmentDetail";

export class Lane {
    id?: string;
    lane_name?: string;
    lane_type?: number;
    lane_of_vehicle?: number;
    client_id?: string;
    port?: string;
    description?: string;
    listEquipment: Array<EquipmentDetail>;
    listUploadfileLane: Array<uploadFileLane>;
};
