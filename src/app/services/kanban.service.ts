import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import * as moment from 'moment';

@Injectable()
export class KanbanService {
  public kanbanAPI = 'kanban/';
  public selectedProject;
  public selectedTask;
  public boards = <any>[];
  public filteredBoards = <any>[];
  constructor(
    private http: Http,
  ) { }

  getProjects(owner: object) {
    const url = this.kanbanAPI + 'projects/';
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getProject(project_id: string) {
    const url = this.kanbanAPI + `project/${project_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  createProject(project_name: string, image?: any) {
    const url = this.kanbanAPI + 'project/';
    const formData = new FormData();
    formData.append('project_name', project_name);
    if (image) formData.append('file', image);
    return this.http.post(url, formData).pipe(map((response: Response) => {
        const res = response.json();
        return res;
    }));
  }

  updateProject(project_data, image?: any) {
    const url = this.kanbanAPI + `project/${project_data.id}/`;
    const formData = new FormData();
    formData.append('project_name', project_data.project_name);
    if (image) formData.append('file', image);
    return this.http.put(url, formData).pipe(map((response: Response) => {
        const res = response.json();
        return res;
    }));
  }

  deleteProject(project_id: string) {
    const url = this.kanbanAPI + `project/${project_id}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
        return response;
    }));
  }

  getBoards(project_id: string) {
    const url = this.kanbanAPI + `boards/${project_id}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  createBoard(project_id: string, board_name: string, board_order: any) {
    const url = this.kanbanAPI + `board/`;
    const formData = new FormData();
    formData.append('board_name', board_name);
    formData.append('kanban_project', project_id);
    formData.append('board_order', board_order);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  renameBoard(board) {
    const url = this.kanbanAPI + `board/${board.id}/`;
    const formData = new FormData();
    formData.append('board_name', board.board_name);
    formData.append('kanban_project', board.kanban_project);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteBoard(board_id: string) {
    const url = this.kanbanAPI + `board/${board_id}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
        return response;
    }));
  }

  getTask(task_id: string) {
    const url = this.kanbanAPI + `task/${task_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  createTask(task_title: string, board_id: string, assignee_id: string) {
    const url = this.kanbanAPI + `task/`;
    const dueDate = new Date();
    const formData = new FormData();
    formData.append('task_title', task_title);
    formData.append('kanban_board', board_id);
    formData.append('task_due_date',  moment(dueDate).format('YYYY-MM-DD'));
    formData.append('color', '#ffffff');
    formData.append('tags', '');
    formData.append('task_description', '');
    formData.append('task_assignee', board_id);
    return this.http.post(url, formData).pipe(map((response: any) => {
      // API does not return created task, so send created task as response to update UI.
      const res = response.json();
      const task = {};
      formData.forEach(function(value, key){
          task[key] = value;
      });
      task['id'] = res.data.id;
      task['title'] = task['task_title'];
      return task;
    }));
  }

  moveTask(task_id: string, new_board_id, order?) {
    const url = this.kanbanAPI + `task/${task_id}/`;
    const formData = new FormData();
    formData.append('kanban_board', new_board_id);
    if (typeof order != "undefined")
	  formData.append('order', order);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response;
    }));
  }

  deleteTask(task_id: string) {
    const url = this.kanbanAPI + `task/${task_id}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
        return response;
    }));
  }

  updateTask(task_data: any) {
    const url = this.kanbanAPI + `task/${task_data.id}/`;
    const formData = new FormData();
    formData.append('task_title', task_data.title);
    formData.append('kanban_board', task_data.kanban_board);
    formData.append('task_due_date', moment(task_data.due_date).format('YYYY-MM-DDThh:mm'));
    formData.append('color', task_data.color[0].color);
    formData.append('tags', task_data.tags.map(el => el.title).join(','));
    formData.append('task_description', task_data.description);
    formData.append('task_assignee', task_data.assignee);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getComments(task_id: string) {
    const url = this.kanbanAPI + `comments/${task_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getTodos(task_id: string) {
    const url = this.kanbanAPI + `subtasks/${task_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getHistory(task_id: string) {
    const url = this.kanbanAPI + `history/${task_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getAttachments(task_id: string) {
    const url = this.kanbanAPI + `attachments/${task_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }


  addComment(commentData: any) {
    const url = this.kanbanAPI + `comment/`;
    const formData = new FormData();
    formData.append('kanban_task_id', commentData.kanban_task_id);
    formData.append('comment', commentData.comment);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  addTodo(todoData: any) {
    const url = this.kanbanAPI + `subtask/`;
    const formData = new FormData();
    formData.append('kanban_task_id', todoData.kanban_task_id);
    formData.append('title', todoData.title);
    formData.append('completed', 'False');
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  updateTodo(todoData) {
    const url = this.kanbanAPI + `subtask/${todoData.id}/`;
    const formData = new FormData();
    formData.append('title', todoData.title);
    formData.append('completed', todoData.completed);
    //formData.append('file', image);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  addAttachment(attachmentData: any) {
    const url = this.kanbanAPI + `attachment/`;
    const formData = new FormData();
    formData.append('kanban_task_id', attachmentData.kanban_task_id);
    formData.append('title', attachmentData.title);
    formData.append('file', attachmentData.file);

    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteTodo(todo_id: string) {
    const url = this.kanbanAPI + `subtask/${todo_id}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteComment(comment_id: string) {
    const url = this.kanbanAPI + `comment/${comment_id}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteAttachment(attachment_id: string) {
    const url = this.kanbanAPI + `attachment/${attachment_id}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  addMember(member_data) {
    const url = this.kanbanAPI + `shares/`;
    return this.http.post(url, member_data).pipe(map((response: Response) => {
        const res = response.json();
        return res;
    }));
  }

  getProjectMembers(project_id) {
    const url = this.kanbanAPI + `shares/${project_id}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  updateMember(data) {
    const url = this.kanbanAPI + `share/${data.id}/`;
    return this.http.put(url, data).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  removeMember(member_id: string) {
    const url = this.kanbanAPI  + `share/${member_id}`;
    return this.http.delete(url).pipe(map((response: Response) => {
        return response;
    }));
  }

  getTags() {
    const url = this.kanbanAPI + 'tags/';
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  updateTag(data) {
    const url = this.kanbanAPI + `tags/${data.id}/`;
    return this.http.put(url, data).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  createShareLink(data: { project: number, password?: string, expire_date?: any}) {
    const url = this.kanbanAPI + 'share-links/';
    return this.http.post(url, data).pipe(map((response: Response) => {
        const res = response.json();
        return res;
    }));
  }

  getShareLinks(kanban_project_id: number) {
    const url = this.kanbanAPI + `share-links/${kanban_project_id}/`;
    return this.http.get(url).pipe(map((response: Response) => {
        const res = response.json();
        return res;
    }));
  }

  deleteShareLink(id: string) {
    const url = this.kanbanAPI  + `share-link/${id}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
        return response;
    }));
  }

  getShareLink(token: string) {
    const url = 'k/' + token + '/';
    return this.http.get(url).pipe(map((response: Response) => {
        const res = response.json();
        return res;
    }));
  }

  getSubscriptions() {
    const url = this.kanbanAPI + 'subscriptions/';
    return this.http.get(url).pipe(map((response: Response) => {
        return response.json();
    }));
  }

  subscribe(task_id: number) {
    const url = this.kanbanAPI + 'subscriptions/';
    return this.http.post(url, { task: task_id }).pipe(map((response: Response) => {
        return response.json();
    }));
  }

  deleteSubscription(id: number) {
    const url = this.kanbanAPI  + `subscriptions/${id}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
        return response;
    }));
  }
}
