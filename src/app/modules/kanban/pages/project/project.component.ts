import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, Subject } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { EditBoardModalComponent } from '@modules/kanban/components/edit-board-modal/edit-board-modal.component';
import { DeleteBoardModalComponent } from '@modules/kanban/components/delete-board-modal/delete-board-modal.component';
import { ManageTaskModalComponent } from '@modules/kanban/components/manage-task-modal/manage-task-modal.component';
import { BsDaterangepickerConfig } from 'ngx-bootstrap';
import { CookieService } from 'ngx-cookie';
import { AuthenticationService, KanbanService, NotificationService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ShareProjectModalComponent } from '@modules/kanban/components/share-project-modal/share-project-modal.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public addTaskFormId = -1;
  public showAddBoardForm = false;
  public boardName: string;
  public bsModalRef: BsModalRef;
  public subscriptions: Subscription[] = [];
  public datepickerConfig: Partial<BsDaterangepickerConfig>;
  public isListView: boolean;
  public selectedProject;
  public isProcessing: boolean;
  public project: any = {};
  public tags: any = [];
  public taskTitle: string;
  public filterText: string;
  public userInfo: any = {};
  public dragging = false;
  public projectMembers = [];
  public member: any = {};
  public allFiltersChecked = true;

  constructor(
    private modalService: BsModalService,
    private cookieService: CookieService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public kanBanService: KanbanService,
    private notify: NotificationService,
    private translate: TranslateService,
    private authenticate: AuthenticationService,
    private changeDetection: ChangeDetectorRef) { }

  ngOnInit() {
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
    this.activatedRoute.params.subscribe(params => {
      this.selectedProject = params.projectId;
      this.getProject();
      this.getBoards();
      this.getUserInfo();
      this.getMembers();
    });
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
        // this.getKanbanProjects();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  getUserInfo() {
    this.authenticate.userInfo().subscribe(res => {
      this.userInfo = res.data;
    });
  }

  openEditBoardModal(board) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(EditBoardModalComponent, {
      class: 'modal-md',
      initialState: {
        selectedBoard: board
      }
    });
  }

  openDeleteBoardModal(board) {
    this.bsModalRef = this.modalService.show(DeleteBoardModalComponent, {
      class: 'modal-md',
      initialState: {
        selectedBoard: board
      }
    });
    this.bsModalRef.content.onClose = new Subject<boolean>();
    this.bsModalRef.content.onClose.subscribe(projectDeleted => {
      if (projectDeleted) {
        this.getBoards();
      }
    });
  }

  openManageTaskModal(task, boardId) {
    this.kanBanService.selectedTask = task;
    this.bsModalRef = this.modalService.show(ManageTaskModalComponent, {
      class: 'modal-lg',
      initialState: {
        selectedTask: task,
        boards: this.kanBanService.boards,
        boardId: boardId,
        members: this.projectMembers
      }
    });
    this.router.navigate([boardId + '/' + task.id], { relativeTo: this.activatedRoute });
    this.bsModalRef.content.onClose = new Subject<boolean>();
    this.bsModalRef.content.onClose.subscribe(action => {
        const boardIndex = this.kanBanService.boards.findIndex(bd => bd.id === boardId);
        const taskIndex = this.kanBanService.boards[boardIndex].kanban_tasks.findIndex(tsk => tsk.id === this.kanBanService.selectedTask.id);
        this.kanBanService.boards[boardIndex].kanban_tasks[taskIndex] = this.kanBanService.selectedTask;
      this.getTags();
      this.getBoards();
      this.router.navigate(['.'], { relativeTo: this.activatedRoute });
    });
  }

  openAddMemberModal(project) {
    this.bsModalRef = this.modalService.show(ShareProjectModalComponent, {
      class: 'modal-lg md--custom',
      initialState: {
        selectedProject: this.kanBanService.selectedProject,
      },
    });
    this.bsModalRef.content.onClose = new Subject<boolean>();
    this.bsModalRef.content.onClose.subscribe(action => {
      if (action === 'refresh-members') {
        this.getProject();
        this.getMembers();
      }
    });
  }

  getProject() {
    this.isProcessing = true;
    this.kanBanService.getProject(this.selectedProject).subscribe((res) => {
      this.kanBanService.selectedProject = res.data.kanban_project;
      this.isProcessing = false;
    });
  }

  getBoards() {
    this.isProcessing = true;
    this.kanBanService.getBoards(this.selectedProject).subscribe((res) => {
      this.kanBanService.boards = res.data.kanban_boards;
      this.kanBanService.filteredBoards = res.data.kanban_boards;
      this.getTags();
      this.isProcessing = false;
      if (this.activatedRoute.children.length > 0) {
        this.activatedRoute.children[0].params.subscribe(params => {
          if (params.boardId && params.taskId) {
            for (const b of this.kanBanService.boards) {
              if (b.id.toString() === params.boardId) {
                for (const t of b.kanban_tasks) {
                  if (t.id.toString() === params.taskId) {
                    this.openManageTaskModal(t, b.id);
                  }
                }
              }
            }
          }
        }
        );
      }
    });
  }

  getTags() {
    this.tags = [];
    this.kanBanService.boards.forEach((board) => {
      if (board.kanban_tasks) {
        const boardTags = board.kanban_tasks.map((task) => task.tags.map(tag => ({ tag: tag.title, checked: false })));
        this.tags = [...this.tags, boardTags];
      }
    });
    this.tags = this.tags.flat(Infinity);
    this.tags = this.tags.filter(tag => tag.tag);
    this.tags.sort((a, b) => (a.tag > b.tag) ? 1 : ((b.tag > a.tag) ? -1 : 0));
    this.tags = this.tags.filter((v, i) => {
      const previous = this.tags[i - 1];
      return !previous ? true : (previous.tag !== v.tag);
    });
  }

  createBoard(e) {
    const boardOrder = this.kanBanService.boards.length;
    this.kanBanService.createBoard(this.selectedProject, this.boardName, boardOrder).subscribe((res) => {
      // API doesn't return board name in the response when created, do this to avoid calling API.
      const created_board = {
        id: res.data.id,
        board_name: this.boardName
      };
      this.kanBanService.boards = [...this.kanBanService.boards, created_board];
      this.showAddBoardForm = false;
      this.boardName = '';
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.BOARD_CREATED_SUCCESS'));
      this.getBoards();
    });
    e.preventDefault();
  }

  createTask(board_id: string, index) {
    this.kanBanService.createTask(this.taskTitle, board_id, this.userInfo.id).subscribe((res) => {
      this.notify.showNotification('success', this.translate.instant('KANBAN.PAGES.TASK_CREATED_SUCCESS'));
      this.getBoards();
      this.addTaskFormId = -1;
      this.taskTitle = '';
    }, err => {
      this.notify.showNotification('danger', this.translate.instant('KANBAN.PAGES.TASK_CREATE_ERROR'));
    });
  }

  showAddTaskForm(index) {
    return this.addTaskFormId === index ? this.addTaskFormId = -1 : this.addTaskFormId = index;
  }

  dragTaskStart() {
    this.dragging = true;
  }

  dragTaskEnd() {
    this.dragging = false;
  }

  onDropTask(event: CdkDragDrop<any[]>, board_id) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    const newBoard: any = event.container.data;
    const movedTask = newBoard[event.currentIndex];
    movedTask.board = board_id;
    for (var i:number=0; i < newBoard.length; ++i)
      this.kanBanService.moveTask(newBoard[i].id, board_id, i).subscribe();
  }

  getMembers() {
    this.kanBanService.getProjectMembers(this.selectedProject).subscribe((res) => {
      this.projectMembers = res;
    });
  }

  removeMember(member_id: string) {
    // this.kanBanService.removeMember(member_id).subscribe(() => {
    //   this.getMembers();
    //   this.notify.showNotification('success', this.translate.instant('KANBAN.PAGES.REMOVE_MEMBER_SUCCESS'));
    // }, err => {
    //   this.notify.showNotification('danger', this.translate.instant('KANBAN.PAGES.REMOVE_USER_ERROR'));
    // });
  }

  selectTag(tag?) {
    // If no tag is received by this method, and there are tags checked, uncheck them all
    if (!tag) {
      this.tags = this.tags.map((tag) => ({ ...tag, checked: false }));
    }
    const checkedTagsLength = this.tags.filter(t => t.checked === true).map(t => t.tag).length;
    this.allFiltersChecked = checkedTagsLength === 0;
    this.filterBoards(checkedTagsLength);
  }

  filterByTag(allBoards, checkedTagsLength) {
    if (!checkedTagsLength) {
      return allBoards;
    }

    // Filter kanban tasks by tag
    const checkedTags = this.tags.filter(t => t.checked === true).map(t => t.tag);
    let filteredBoards = JSON.parse(JSON.stringify(allBoards));
    filteredBoards = filteredBoards.map((board) => {
      board.kanban_tasks = board.kanban_tasks.filter((task) => {
        return task.tags.some((tag) => {
          return checkedTags.includes(tag.title);
        });
      });
      return board;
    });
    // Filter out empty boards
    return filteredBoards.filter((board) => !!board.kanban_tasks.length);
  }

  filterByTitle(allBoards) {
    // Filter kanban tasks by title
    let filteredBoards = JSON.parse(JSON.stringify(allBoards));
    if (this.filterText == '')
      return filteredBoards;
    filteredBoards = filteredBoards.map((board) => {
      board.kanban_tasks = board.kanban_tasks.filter((task) => {
        return task.title.toLowerCase().includes(this.filterText.toLowerCase());
      });
      return board;
    });
    // Filter out empty boards
    return filteredBoards.filter((board) => !!board.kanban_tasks.length);
  }

  filterBoards(checkedTagsLength?) {
    const allBoards = [...this.kanBanService.boards];
    this.filterText = this.filterText || '';
    let filteredBoards = this.filterByTitle(allBoards);
    filteredBoards = this.filterByTag(filteredBoards, checkedTagsLength);
    this.kanBanService.filteredBoards = filteredBoards;
  }
}
