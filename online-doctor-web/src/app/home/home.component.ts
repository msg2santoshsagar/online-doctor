import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../service/websocket.service';

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

  constructor(private router: Router, private authService: AuthService, private webSocketService: WebsocketService) { }

  ngOnInit() {
    this.webSocketService.connect();
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  StartANewConsultation() {
    console.log("Request to start a new consultation");

  }

  logOut() {
    console.log("Request to logout");
    this.authService.doLogOut();
    this.router.navigate(['login']);
  }



}
