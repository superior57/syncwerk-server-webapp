import { Subscription, combineLatest, Subject } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AddProjectModalComponent } from '@modules/kanban/components/add-project-modal/add-project-modal.component';
import { RenameProjectModalComponent } from '@modules/kanban/components/rename-project-modal/rename-project-modal.component';
import { RemoveProjectModalComponent } from '@modules/kanban/components/remove-project-modal/remove-project-modal.component';
import { ShareProjectModalComponent } from '@modules/kanban/components/share-project-modal/share-project-modal.component';
import { CookieService } from 'ngx-cookie';
import { KanbanService, AuthenticationService } from 'app/services';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss']
})
export class BoardsComponent implements OnInit {
  public bsModalRef: BsModalRef;
  public isListView: boolean;
  public subscriptions: Subscription[] = [];
  public projects = [];
  public loadingProjects = false;
  public userInfo;
  public projectName = '';
  public pagination = {
    page: 1,
    itemsPerPage: 30,
  };
  public maxSize = 5;

  constructor(
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private cookieService: CookieService,
    private kanbanService: KanbanService,
    private authenticate: AuthenticationService,
  ) { }

  ngOnInit() {
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
    this.getUserInfo();
    this.getKanbanProjects();
  }

  toggleView(isListView: boolean) {
    return this.isListView = isListView;
  }

  prepareModalSubscription() {
    const _combine = combineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getKanbanProjects();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  getUserInfo() {
    this.authenticate.userInfo().subscribe(resp => {
      this.userInfo = resp.data;
    });
  }

  getKanbanProjects() {
    this.loadingProjects = true;
    return this.kanbanService.getProjects(this.userInfo).subscribe((res) => {
      console.log('this res -->', res);
      this.projects = res.data.kanban_projects;
      this.loadingProjects = false;
    });
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  openAddProjectModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(AddProjectModalComponent, {
      class: 'modal-md',
      initialState: {
        owner: this.userInfo,
      }
    });
  }

  openRenameProjectModal(project) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(RenameProjectModalComponent, {
      class: 'modal-md',
      initialState: {
        selectedProject: project,
      }
    });
  }

  openRemoveProjectModal(project) {
    this.bsModalRef = this.modalService.show(RemoveProjectModalComponent, {
      class: 'modal-md',
      initialState: {
        selectedProject: project,
        isOwner: project.owner.email === this.userInfo.email,
      },
    });
    this.bsModalRef.content.onClose = new Subject<boolean>();
    this.bsModalRef.content.onClose.subscribe(projectDeleted => {
      if (projectDeleted) {
        this.getKanbanProjects();
      }
    });
  }

  openShareProjectModal(project) {
    this.bsModalRef = this.modalService.show(ShareProjectModalComponent, {
      class: 'modal-lg md--custom',
      initialState: {
        selectedProject: project,
      },
    });
  }
}
