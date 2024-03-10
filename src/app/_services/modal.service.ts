import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
    constructor(private modalService: ModalService) {
        
    }
    public modals: any[] = [];
    public modalStatus: Subject<any> = new Subject<any>();

    add(modal: any) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x.id !== id);
    }

    open(id: string) {
        // open modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
        if (modal != null  && modal != undefined)
        {
            modal.open();
        }
    }

    openEquipment(id: string, flagState: string, flagStateEquipment: string) {
        this.modals.push(flagState);
        this.modals.push(flagStateEquipment);
        // open modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
        if (modal != null  && modal != undefined)
        {
            modal.flagState = flagState;
            modal.flagStateEquipment = flagStateEquipment;
            modal.openEquipment();
        }
    }

    close(id: string) {
        // close modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
       
        modal.close();
    }
}