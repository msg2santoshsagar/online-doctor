import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../service/websocket.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

declare let paypal: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  doctorList: any = []; // Doctor list
  globalMessages: any = {}; // Map of doctor and message
  currentActiveMessageList: any = []; // Current Acitve message list
  defaultDocterName = 'Start New consultation';
  currentActiveDoctorName: string = this.defaultDocterName; // Current Acitve message list

  showReplyBox: boolean = false;
  DR_ASSISTANT_NAME: string = 'Dr. Assistant';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  replyMessage: string = '';

  feePackages = [{
    id: 1,
    name: 'One',
    credit: 1,
    price: 199
  }, {
    id: 2,
    name: 'Five',
    credit: 5,
    price: 899
  }, {
    id: 3,
    name: 'Ten',
    credit: 10,
    price: 1599
  }];

  @ViewChild("chatMessageContainer") chatMessageContainer: ElementRef;
  disableScrollDown: boolean = false;

  paypalButtonVisible: boolean = false;
  finalAmount: number = 1;
  selectedMessage;

  paypalConfig = {
    env: 'sandbox',
    client: {
      sandbox: 'demo_sandbox_client_id',
      production: '<your-production-key here>'
    },
    commit: true,
    locale: 'en_US',
    style: {
      size: 'small',
      color: 'gold',
      shape: 'pill',
    },
    payment: (data, actions) => {
      return actions.payment.create({
        payment: {
          transactions: [
            {
              amount: {
                total: this.finalAmount,
                currency: 'USD'
              }
            }
          ]
        },
        experience: {
          input_fields: {
            no_shipping: 1
          }
        }
      });
    },
    onAuthorize: (data, actions) => {
      return actions.payment.execute().then((payment) => {
        //Do something when payment is successful.
        console.log("Payment successfull for :: ", payment);
        let request = {
          message: this.selectedMessage,
          payment: payment
        }
        this.http.post(environment.CONSULATATION_PACKAGE_PURCHASED_END_POINT, request, this.httpOptions).subscribe(
          (response: any) => {
            console.log("Consultation fee purchased :: ", response);
            this.selectedMessage.oldMessage = true;
          }, (err: any) => {
            console.log("Error occured while buying consultation fee package : ", err);
          }
        )
      })
    },
    onCancel: (data, actions) => {
      console.log("Payment cancelled");
      alert("You cancelled the payment");
      this.paypalButtonVisible = false;
    },
    onError: function (err) {
      console.log("Payment cancelled due to error ", err);
      alert("You cancelled the payment");
      this.paypalButtonVisible = false;
    }
  };


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

    if (this.globalMessages[userName] != null) {
      lastMessageId = this.globalMessages[userName].messageList[this.globalMessages[userName].messageList.length - 1].id;
    }

    console.log("last message id :: ", lastMessageId);

    let reqBody = {
      lastMessageId: lastMessageId,
      forUserName: userName
    };

    this.http.post(environment.MESSAGE_LIST_BY_USER_END_POINT, reqBody, this.httpOptions).subscribe(
      (res: any) => {
        console.log("Extra data found from server :: ", res);
        if (res.length == 0) {
          return;
        }
        if (this.globalMessages[userName] == null) {
          this.globalMessages[userName] = {
            messageList: res
          };
          this.prepareMessageList();
        } else {
          console.log("In else part");

          if (userName == this.DR_ASSISTANT_NAME) {
            var localMessageList = this.globalMessages[userName].messageList;

            for (var i = localMessageList.length - 1; i >= 0; i--) {
              var localMessage = localMessageList[i];
              if (localMessage.oldMessage === true) {
                break;
              }
              localMessage.oldMessage = true;
            }

          }

          for (var i = 0; i < res.length; i++) {
            this.globalMessages[userName].messageList.push(res[i]);
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
        console.log("GLobal message for doctor :: ", this.globalMessages[doctorName]);

        doctor.shortMessage = this.globalMessages[doctorName]['messageList'][this.globalMessages[doctorName].messageList.length - 1].shortMessage;

        doctor.time = this.globalMessages[doctorName]['messageList'][this.globalMessages[doctorName].messageList.length - 1].createdDate

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

  updateUserDesignation(userName) {
    //console.log("Request to update user designation : ", userName);
    this.http.post(environment.USER_DESIGNATION_END_POINT, { userName: userName }, this.httpOptions).subscribe(
      (res: any) => {
        //console.log("User Designation Result found :: ", res);
        this.globalMessages[userName].designation = res.designation;
      }, (err: any) => {
        console.log("Error occured while finding designation for the user : ", userName);
      }
    )
  }

  prepareMessageList() {
    var localDoctorList = [];
    var doctorNames = Object.keys(this.globalMessages);
    for (var i = 0; i < doctorNames.length; i++) {
      var doctorName = doctorNames[i];
      //console.log("Designation for doctor : ", doctorName, " is ", this.globalMessages[doctorName].designation);
      if (this.globalMessages[doctorName].designation == undefined) {
        this.updateUserDesignation(doctorName);
      }
      var doctorDetail = {
        name: doctorName,
        shortMessage: this.globalMessages[doctorName]['messageList'][this.globalMessages[doctorName].messageList.length - 1].shortMessage,
        time: this.globalMessages[doctorName]['messageList'][this.globalMessages[doctorName].messageList.length - 1].createdDate
      }
      localDoctorList.push(doctorDetail);
    }
    this.doctorList = localDoctorList;
    if (this.doctorList.length > 0) {
      this.currentActiveDoctorName = this.doctorList[0].name;
      this.currentActiveMessageList = this.globalMessages[this.currentActiveDoctorName].messageList;
    }
    console.log("Current active doctor name :: ", this.currentActiveDoctorName);
    if (this.currentActiveDoctorName != this.defaultDocterName && this.currentActiveDoctorName != this.DR_ASSISTANT_NAME) {
      this.showReplyBox = true;
    }
  }

  StartANewConsultation() {
    console.log("Request to start a new consultation");
    this.paypalButtonVisible = false;
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
    console.log("Scroll to bottom disabled :: ", this.disableScrollDown);
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
    this.currentActiveMessageList = this.globalMessages[doctor.name].messageList;
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

    if (userMessage == null || userMessage == undefined || userMessage.trim() == '') {
      return;
    }


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



  payConsultationFee(message, feePackage) {
    console.log("Request to pay consultation fee for : ", message, feePackage);
    message.selectedPackage = feePackage;
    this.selectedMessage = message;
    this.finalAmount = feePackage.price;
    this.initPaypalButton();
  }

  initPaypalButton(): void {
    if (!this.paypalButtonVisible) {
      paypal.Button.render(this.paypalConfig, '#paypal-checkout-btn');
      this.paypalButtonVisible = true;
    }
  }

}
