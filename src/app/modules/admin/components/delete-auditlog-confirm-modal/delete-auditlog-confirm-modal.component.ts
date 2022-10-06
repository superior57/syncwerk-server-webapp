import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdminService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-auditlog-confirm-modal',
  templateUrl: './delete-auditlog-confirm-modal.component.html',
  styleUrls: ['./delete-auditlog-confirm-modal.component.scss']
})
export class DeleteAuditlogConfirmModalComponent implements OnInit {
  @Output() onDeleteSuccess = new EventEmitter();

  constructor(private adminService: AdminService,
              private translate: TranslateService
              ) { }

  ngOnInit() {
  }

  deleteAuditLog() {
    this.adminService.deleteAllAuditLog().subscribe((resps) => {
      this.onDeleteSuccess.emit({
        message: this.translate.instant('ADMIN.AUDIT_LOG.DELETE_SUCCESS')
      });
    })
  }
}
