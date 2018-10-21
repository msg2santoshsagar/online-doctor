import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  doctorList: any = []; // Doctor list
  messageList: any = {}; // Map of doctor and message
  currentActiveMessageList: any = []; // Current Acitve message list


  showReplyBox: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  StartANewConsultation() {
    console.log("Request to start a new consultation");

  }



}
