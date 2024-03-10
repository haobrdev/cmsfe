import { Component, ElementRef, Input, OnInit, OnDestroy } from "@angular/core";

import { ModalService } from "src/app/_services/modal.service";

@Component({
  selector: "app-confirm-modal",
  template: `
    <div class="app-modal">
      <div class="app-modal-body">
        <ng-content></ng-content>
        <div class="btn-remove" (click)="close()">
          <span><i class="fa fa-close"></i></span>
        </div>
      </div>
    </div>
    <div class="app-modal-background"></div>
  `
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  private element: any;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    let modal = this;

    // ensure id attribute exists
    if (!this.id) {
      console.error("modal must have an id");
      return;
    }

    // move element to bottom of page (just before </body>) so it can be displayed above everything else
    document.body.appendChild(this.element);
    
    // add self (this modal instance) to the modal service so it's accessible from controllers
    this.modalService.add(this);
  }

  // remove self from modal service when component is destroyed
  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  // open modal
  open(): void {
    this.element.style.display = "block";
    document.body.classList.add("app-modal-open");
  }

  // close modal
  close(): void {
    this.element.style.display = "none";
    document.body.classList.remove("app-modal-open");
    this.modalService.modalStatus.next({
      id: this.id,
      type: "close",
    });
  }
}
