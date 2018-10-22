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
  globalMessages: any = {}; // Map of doctor and message
  currentActiveMessageList: any = []; // Current Acitve message list
  currentActiveDoctorName: string = 'Start New consultation'; // Current Acitve message list


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
        try {
          let messageJson = JSON.parse(message);
          this.messageHandler(messageJson);
        } catch (e) {
          console.log("Not able to parse message to json");
        }


      }, (err: any) => {
        console.log("Error while getting new message ", err);
      }
    )
  }

  fetchNewMessageForUser(userName) {
    console.log("Request to fetch the new message for user ", userName);
    var lastMessageId = 0;

    if (this.globalMessages[userName] != null && this.globalMessages[userName].messageId != null) {
      lastMessageId = this.globalMessages[userName].messageId;
    }

    console.log("last message id :: ", lastMessageId);

    let reqBody = {
      lastMessageId: lastMessageId,
      forUserName: userName
    };

    this.http.post(environment.MESSAGE_LIST_BY_USER_END_POINT, reqBody, this.httpOptions).subscribe(
      (res: any) => {
        console.log("Extra data found from server :: ", res);
        if (this.globalMessages[userName] == null) {
          this.globalMessages[userName] = res;
        } else {
          console.log("In else part");
          for (var i = 0; i < res.length; i++) {
            this.globalMessages[userName].messages.push(res[i]);
            if (this.globalMessages[userName].messageId < res[i].id) {
              this.globalMessages[userName].messageId = res[i].id;
            }
          }
          this.updateShortMessageAndTime(userName);
        }
      }, (err: any) => {
        console.log("Error occured while finding extra data from server", err);
      }
    )

  }

  updateShortMessageAndTime(doctorName) {

    for (var i = 0; i < this.doctorList.length; i++) {

      var doctor = this.doctorList[i];

      if (doctor.name == doctorName) {

        console.log("Doctor detail matched :: ", doctor);
        console.log("Last message id :: ", this.globalMessages[doctorName].messageId);
        console.log("GLobal message for doctor :: ", this.globalMessages[doctorName]);

        doctor.shortMessage = this.globalMessages[doctorName]['messages'][this.globalMessages[doctorName].messageId - 1].shortMessage;

        doctor.time = this.globalMessages[doctorName]['messages'][this.globalMessages[doctorName].messageId - 1].time

        console.log("now doctor detail :: ", doctor);
      }




    }
  }

  messageHandler(messageJson) {
    let task = messageJson.task;

    switch (task) {
      case 'NEW_MESSAGE_AVAILABLE': this.fetchNewMessageForUser(messageJson.from);
        break;
      default: console.log("Implementation for task not available :: ", task);
        break;
    }


  }

  LoadMessageList() {
    this.http.get(environment.MESSAGE_LIST_END_POINT, this.httpOptions).subscribe(
      (res: any) => {
        console.log("Message list found :: ", res);
        if (res == null) {
          this.globalMessages = {};
        } else {
          this.globalMessages = res;
          this.prepareMessageList();
        }

      }, (err: any) => {
        console.log("Error occured while finding message list for user");
      }
    )
  }

  prepareMessageList() {
    var localDoctorList = [];
    var doctorNames = Object.keys(this.globalMessages);
    for (var i = 0; i < doctorNames.length; i++) {
      var doctorName = doctorNames[i];
      var doctorDetail = {
        name: doctorName,
        designation: this.globalMessages[doctorName].designation,
        shortMessage: this.globalMessages[doctorName]['messages'][this.globalMessages[doctorName].messageId - 1].shortMessage,
        time: this.globalMessages[doctorName]['messages'][this.globalMessages[doctorName].messageId - 1].time
      }
      localDoctorList.push(doctorDetail);
    }
    this.doctorList = localDoctorList;
    if (this.doctorList.length > 0) {
      this.currentActiveDoctorName = this.doctorList[0].name;
      this.currentActiveMessageList = this.globalMessages[this.currentActiveDoctorName].messages;
    }
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
