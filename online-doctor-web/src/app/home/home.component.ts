import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../service/websocket.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  doctorList: any = []; // Doctor list
  messageList: any = {}; // Map of doctor and message
  currentActiveMessageList: any = []; // Current Acitve message list


  showReplyBox: boolean = false;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  constructor(private router: Router, private authService: AuthService, private webSocketService: WebsocketService, private http: HttpClient) { }

  ngOnInit() {
    this.LoadMessageList();
    this.webSocketService.connect();
    this.InitWebSocketMessageReceiver();
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  InitWebSocketMessageReceiver() {
    this.webSocketService.messages.subscribe(
      (message: any) => {
        console.log("New Message received from server :: ", message);
      }, (err: any) => {
        console.log("Error while getting new message ", err);
      }
    )
  }

  LoadMessageList() {
    this.http.get(environment.MESSAGE_LIST_END_POINT, this.httpOptions).subscribe(
      (res: any) => {
        console.log("Message list found :: ", res);
        if (res == null) {
          this.messageList = {};
        } else {
          this.messageList = {};
        }

      }, (err: any) => {
        console.log("Error occured while finding message list for user");
      }
    )
  }

  StartANewConsultation() {
    console.log("Request to start a new consultation");
    this.webSocketService.sendMessage({
      task: 'START_NEW_CONSULTATION'
    });
  }

  logOut() {
    console.log("Request to logout");
    this.authService.doLogOut();
    this.router.navigate(['login']);
  }



}
