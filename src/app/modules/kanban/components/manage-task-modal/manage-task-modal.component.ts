import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { BsDaterangepickerConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService, KanbanService, AuthenticationService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';
import { colorCodes } from './colors';
import * as moment from 'moment';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { deLocale} from 'ngx-bootstrap/locale';

declare var Quill: any;

@Component({
  selector: 'app-manage-task-modal',
  templateUrl: './manage-task-modal.component.html',
  styleUrls: ['./manage-task-modal.component.scss']
})

export class ManageTaskModalComponent implements OnInit, AfterViewInit, OnDestroy {
  public todoTitle = '';
  // public selectedTask: any = {};
  public editTitle = false;
  public showAddTodo = false;
  public isEditingDescription = false;
  public isProcessing = false;
  public boards: any = {};
  public boardId: string;
  public currentBoard: any = {};
  public comment = '';
  public newTag = [];
  public userInfo: any = {};
  public members: any;
  public assignee: any = {};
  public uploadingFile = false;
  public loadingAttachments = false;
  public selectedAttachment = null;
  public tags = [];
  public subscriptions: {id: number, task: number}[] = [];
  protected editingTag: {id: number, title: string, color: string} = null;

  htmlEditor: any;
  htmlEditorReadOnly: any;
  htmlEditorToolBarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
    ['link', 'image'],
  ];
  public colorCodes = colorCodes;

  public datepickerConfig: Partial<BsDaterangepickerConfig>;

  constructor(public bsModalRef: BsModalRef,
              private notify: NotificationService,
              private translate: TranslateService,
              protected bsLocalService: BsLocaleService,
              protected sanitizer: DomSanitizer,
              public kanbanService: KanbanService,
              private authenticate: AuthenticationService,
              private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.kanbanService.getTask(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask = res.data.kanban_task;
      this.getAttachments();
      this.getTodos();
      this.getComments();
      this.getHistory();
      this.getTags();
      this.kanbanService.getSubscriptions().subscribe((result) => {
        this.subscriptions = result;
      });
    });
    defineLocale('de', deLocale);
    this.bsLocalService.use(this.translate.currentLang);
  }

  ngAfterViewInit() {
    this.getUserInfo();
    // Configure editor
    this.htmlEditor = new Quill('#taskDescriptionEditor', {
      modules: {
        toolbar: this.htmlEditorToolBarOptions,
        imagePaste: true
      },
      theme: 'snow',
      placeholder: 'Add a description',
    });
    this.htmlEditorReadOnly = new Quill('#taskDescriptionEditorReadOnly', {
      modules: {
        toolbar: false,
      },
      readOnly: true,
      theme: 'snow',
    });
    this.htmlEditor.container.firstChild.innerHTML = this.kanbanService.selectedTask.description || '';
    this.htmlEditorReadOnly.container.firstChild.innerHTML = this.kanbanService.selectedTask.description || '';

    setTimeout(() => {
      document.getElementById('taskDescriptionEditor').style.display = 'none';
      const toolbar: HTMLElement = document.querySelector('.ql-toolbar');
      toolbar.style.display = 'none';
    }, 100);

    // Date picker config
    this.datepickerConfig = Object.assign({}, {
      containerClass: 'theme-blue',
      dateInputFormat: 'YYYY-MM-DD'
    });

    // this.assignee = this.members.filter(member => member.user_data.email === this.selectedTask.assigned_member);
    // console.log('assignee ---', this.assignee);
    this.currentBoard = this.boards.filter(el => el.id === this.boardId);
  }

  closeModal() {
    this.updateTask();
    this.bsModalRef.hide();
  }

  editDescription() {
    this.isEditingDescription = true;
    document.getElementById('taskDescriptionEditorReadOnly').style.display = 'none';
    document.getElementById('taskDescriptionEditor').style.display = 'block';
    const toolbar: HTMLElement = document.querySelector('.ql-toolbar');
    toolbar.style.display = 'block';
  }

  saveDescription() {
    const htmlContent = this.htmlEditor.getContents();
    this.kanbanService.selectedTask.description = this.htmlEditor.getLength() > 1 ? this.htmlEditor.container.firstChild.innerHTML : '';
    this.isEditingDescription = false;
    document.getElementById('taskDescriptionEditorReadOnly').style.display = 'block';
    document.getElementById('taskDescriptionEditor').style.display = 'none';
    const toolbar: HTMLElement = document.querySelector('.ql-toolbar');
    toolbar.style.display = 'none';
    this.updateTask();
    this.htmlEditorReadOnly.container.firstChild.innerHTML = this.kanbanService.selectedTask.description || '';
  }

  cancelEditor() {
    this.isEditingDescription = false;
    document.getElementById('taskDescriptionEditorReadOnly').style.display = 'block';
    document.getElementById('taskDescriptionEditor').style.display = 'none';
    const toolbar: HTMLElement = document.querySelector('.ql-toolbar');
    toolbar.style.display = 'none';
  }

  setColor(color: string) {
    this.kanbanService.selectedTask.color[0] = { color };
    this.updateTask();
  }

  setDate(event) {
    this.kanbanService.selectedTask.due_date = moment(event).format();
    this.updateTask();
  }

  deleteTask() {
    this.isProcessing = true;
    this.kanbanService.deleteTask(this.kanbanService.selectedTask.id).subscribe(resp => {
      this.isProcessing = false;
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.TASK_DELETE_SUCCESS'));
      this.bsModalRef.content.onClose.next('delete');
      this.closeModal();
    }, err => {
      this.isProcessing = false;
      this.notify.showNotification('danger',  this.translate.instant('KANBAN.MODALS.TASK_DELETE_ERROR'));
      this.closeModal();
    });
  }

  // @param action(specify the type of update action done).
  updateTask(action?: any) {
    this.isProcessing = true;
    this.kanbanService.updateTask(this.kanbanService.selectedTask).subscribe((res) => {
      this.kanbanService.selectedTask.tags = res.data.tags;
      this.bsModalRef.content.onClose.next(action);
      this.isProcessing = false;
    });
  }

  moveTask(board) {
    if (board.id === this.kanbanService.selectedTask.kanban_board) {
      return;
    }
    this.kanbanService.selectedTask.kanban_board = board.id;
    this.closeModal();
  }

  addTodo() {
    const todo = { title: this.todoTitle, completed: false, kanban_task_id: this.kanbanService.selectedTask.id };
    this.kanbanService.selectedTask.todos = [...this.kanbanService.selectedTask.todos, todo];
    this.todoTitle = '';
    this.kanbanService.addTodo(todo).subscribe((res) => {
      this.getTodos();
      this.showAddTodo = false;
    });
  }

  updateTodo(index, todo) {
    this.kanbanService.selectedTask.todos[index].completed = !this.kanbanService.selectedTask.todos[index].completed;
    console.log(this.kanbanService.selectedTask.todos[index]);
    this.isProcessing = true;
    this.kanbanService.updateTodo(this.kanbanService.selectedTask.todos[index]).subscribe((res) => {
      this.bsModalRef.content.onClose.next();
      this.isProcessing = false;
    });
  }

  deleteTodo(index, todo) {
    this.kanbanService.selectedTask.todos.splice(index, 1);
    this.kanbanService.deleteTodo(todo.id).subscribe();
  }

  getUserInfo() {
    this.authenticate.userInfo().subscribe(resp => {
      this.userInfo = resp.data;
    });
  }

  getTodos() {
    this.kanbanService.getTodos(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask.todos = res.data.kanban_sub_tasks;
    });
  }

  getComments() {
    this.kanbanService.getComments(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask.comments = res.data.kanban_comments;
    });
  }

  getHistory() {
    this.kanbanService.getHistory(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask.history = res.data.kanban_history;
    });
  }

  getAttachments() {
    this.loadingAttachments = true;
    this.kanbanService.getAttachments(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.loadingAttachments = false;
      this.kanbanService.selectedTask.attachments = res.data.kanban_attachs;
    });
  }

  getTags() {
    // get all tags for type ahead completion
    this.kanbanService.getTags().subscribe((res) => {
      this.tags = res;
    });
  }

  addComment() {
    const commentData = {
      kanban_task_id: this.kanbanService.selectedTask.id,
      comment: this.comment,
    };
    this.kanbanService.addComment(commentData).subscribe((res) => {
      this.getComments();
    });
    this.comment = '';
  }

  deleteComment(index, comment) {
    this.kanbanService.deleteComment(comment.id).subscribe(() => {
      this.kanbanService.selectedTask.comments.splice(index, 1);
    });
    this.updateTask();
  }

  deleteAttachment() {
    this.isProcessing = true;
    const attachment = this.selectedAttachment;
    this.kanbanService.deleteAttachment(attachment.id).subscribe(() => {
      this.selectedAttachment = null;
      this.isProcessing = false;
      this.kanbanService.selectedTask.attachments = this.kanbanService.selectedTask.attachments.filter(el => el.id !== attachment.id);
    });
  }

  onTagAdded($event) {
    const tag = this.newTag[0].value || this.newTag[0].title;
    this.newTag = [];
    const tagExist = (this.kanbanService.selectedTask.tags || []).find(el => el.title === tag);
    if (tagExist === undefined) {
      this.kanbanService.selectedTask.tags.push({ title: tag });
    }
    this.updateTask('update-tags');
  }

  fgColor(bgColor) {
    const int = parseInt(bgColor, 16);
    const b = int & 0xff,
      g = int >> 8   & 0xff,
      r = int >> 16  & 0xff;
    if (r + g + b > 0x80 * 3) {
      return '#000000';
    }
    return '#ffffff';
  }

  removeTag(index) {
    this.kanbanService.selectedTask.tags.splice(index, 1);
    this.updateTask('update-tags');
  }

  editTag(index) {
    this.editingTag = Object.assign({}, this.kanbanService.selectedTask.tags[index]);
  }

  setTagColor(color: string) {
    this.editingTag.color = color.substr(1);
  }

  saveTag() {
    this.kanbanService.updateTag(this.editingTag).subscribe((res) => {
      for (const i in this.kanbanService.selectedTask.tags) {
        if (this.kanbanService.selectedTask.tags[i].id === res.id) {
          this.kanbanService.selectedTask.tags[i] = res;
          break;
        }
      }
      this.editingTag = null;
    });
  }

  cancelTagEdit() {
    this.editingTag = null;
  }

  assignTask(user) {
    this.kanbanService.selectedTask.assignee = user;
    // this.assignee = this.members.filter(member => member.user_data.email === user.user_data.email);
    this.updateTask();
  }

  attachFile(file: any) {
    this.uploadingFile = true;
    const fileData = {
      kanban_task_id: this.kanbanService.selectedTask.id,
      title: file[0].name,
      file: file[0]
    };

    this.kanbanService.addAttachment(fileData).subscribe((res) => {
      this.uploadingFile = false;
      this.getAttachments();
    });
  }

  getFileExtension(filename: string) {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
  }

  subscribe() {
    this.kanbanService.subscribe(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.getSubscriptions().subscribe((result) => {
        this.subscriptions = result;
      });
    });
  }

  unsubscribe() {
    for (const s in this.subscriptions) {
      if (this.subscriptions[s].task === this.kanbanService.selectedTask.id) {
        this.kanbanService.deleteSubscription(this.subscriptions[s].id).subscribe((res) => {
          this.kanbanService.getSubscriptions().subscribe((result) => {
            this.subscriptions = result;
          });
        });
      }
    }
  }

  isSubscribed() {
    for (const s in this.subscriptions) {
      if (this.subscriptions[s].task === this.kanbanService.selectedTask.id) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    this.updateTask();
  }
}
