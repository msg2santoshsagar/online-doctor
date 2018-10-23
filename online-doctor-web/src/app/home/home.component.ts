import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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

  showReplyBox: boolean = true;
  DR_ASSISTANT_NAME: string = 'Dr. Assistant';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  replyMessage: string = '';

  @ViewChild("chatMessageContainer") chatMessageContainer: ElementRef;
  disableScrollDown: boolean = false;

  constructor(private router: Router, private authService: AuthService, private webSocketService: WebsocketService, private http: HttpClient) {
    this.authService.validateLogin();
  }

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
          this.prepareMessageList();
        } else {
          console.log("In else part");

          if (userName == this.DR_ASSISTANT_NAME) {
            var localMessageList = this.globalMessages[userName].messages;

            for (var i = localMessageList.length - 1; i >= 0; i--) {
              var localMessage = localMessageList[i];
              if (localMessage.oldMessage != undefined) {
                break;
              }
              localMessage.oldMessage = true;
            }

          }

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

  setUserTypingMessage(user) {
    if (this.globalMessages[user] != null && this.globalMessages[user] != undefined) {
      this.globalMessages[user].typing = true;
      var that = this;
      setTimeout(function () {
        that.globalMessages[user].typing = false;
      }, 1000);
    }
  }

  messageHandler(messageJson) {
    let task = messageJson.task;

    switch (task) {
      case 'NEW_MESSAGE_AVAILABLE': this.fetchNewMessageForUser(messageJson.from);
        break;
      case 'USER_TYPING_MESSAGE': this.setUserTypingMessage(messageJson.who);
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
      console.log("Designation for doctor : ", doctorName, " is ", this.globalMessages[doctorName].designation);
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
    if (this.currentActiveDoctorName != this.DR_ASSISTANT_NAME) {
      this.showReplyBox = true;
    }
  }

  StartANewConsultation() {
    console.log("Request to start a new consultation");
    this.webSocketService.sendMessage({
      task: 'START_NEW_CONSULTATION'
    });
    this.OnSelectDoctor({ name: this.DR_ASSISTANT_NAME });
  }

  logOut() {
    console.log("Request to logout");
    this.authService.doLogOut();
    this.router.navigate(['login']);
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onScroll() {
    let element = this.chatMessageContainer.nativeElement;
    let currentWindowPos = element.scrollHeight - element.scrollTop;
    let diff = currentWindowPos - element.clientHeight;
    diff = Math.abs(diff);
    if (this.disableScrollDown && diff <= 1) {
      this.disableScrollDown = false
    } else {
      this.disableScrollDown = true
    }
    //console.log(" On scroll called :: disableScroll down : ", this.disableScrollDown);
  }


  private scrollToBottom(): void {
    //console.log("Scroll to bottom :: ", this.disableScrollDown);
    if (this.disableScrollDown) {
      return
    }
    try {
      this.chatMessageContainer.nativeElement.scrollTo({ top: this.chatMessageContainer.nativeElement.scrollHeight, behavior: 'smooth' })
      // this.myScrollContainer.nativeElement.scroll
      //this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  setAnswer(message, answer) {
    message.answer = answer;
    return true;
  }

  OnAnswerSelected(message) {
    console.log("Answer selected for :: ", message);
    let reqBody = {
      id: message.id,
      answer: message.answer
    }
    if (reqBody.answer == null || reqBody.answer == undefined || reqBody.answer.trim() == '') {
      console.log("valid answer not available");
      return;
    }

    this.http.post(environment.ANSWER_SELECTED_END_POINT, reqBody, this.httpOptions).subscribe(
      (res: any) => {
        console.log("Answer selected response : ", res);
      }, (err: any) => {
        console.log("Error while answer selected : ", err);
      }
    )
  }

  OnSelectDoctor(doctor) {
    console.log("Request to select doctor :: ", doctor);
    if (this.currentActiveDoctorName == doctor.name) {
      return;
    }
    if (this.globalMessages[doctor.name] == null || this.globalMessages[doctor.name] == undefined) {
      console.log("Detail for doctor not available");
      return;
    }
    this.currentActiveDoctorName = doctor.name;
    this.currentActiveMessageList = this.globalMessages[doctor.name].messages;
    this.showReplyBox = false;
    if (this.currentActiveDoctorName != this.DR_ASSISTANT_NAME) {
      this.showReplyBox = true;
    }
  }

  OnSendReply(e) {
    console.log("on send reply called :: ", this.replyMessage);
    e.preventDefault();
    let userMessage = this.replyMessage;
    this.replyMessage = '';
    this.webSocketService.sendMessage({
      task: 'TEXT_MESSAGE',
      from: this.authService.getUsername(),
      to: this.currentActiveDoctorName,
      msg: userMessage
    })

    this.globalMessages[this.currentActiveDoctorName].messages.push({
      id: this.globalMessages[this.currentActiveDoctorName].messageId + 1,
      template: 'TEMPLATE_7',
      time: new Date(),
      userSent: false,
      shortMessage: userMessage,
      actMessage: userMessage
    });
    this.globalMessages[this.currentActiveDoctorName].messageId = this.globalMessages[this.currentActiveDoctorName].messageId + 1;
    this.updateShortMessageAndTime(this.currentActiveDoctorName);
  }

  UserTypingMessage() {
    console.log("User typing message");
    this.webSocketService.sendMessage({
      task: 'USER_TYPING_MESSAGE',
      to: this.currentActiveDoctorName,
      from: this.authService.getUsername()
    });
  }

}
