import { Injectable, EventEmitter } from '@angular/core';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket$: WebSocketSubject<any>;

  public messages: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  connect() {
    console.log("Request to connect to web socket");
    this.socket$ = new WebSocketSubject<any>({
      url: environment.WS_END_POINT,
      deserializer: function (e) {
        return e.data;
      }
    });

    this.socket$
      .subscribe(
        (message) => {
          console.log("Message received ", message);
          this.messages.next(message);
        },
        (err) => console.error(
          err
        ),
        () => console.warn('Completed!')
      );
  }

  sendMessage(message) {
    this.socket$.next(message);
  }

  disconnect() {
    console.log("Request to disconnect to web socket");
    this.socket$.unsubscribe();
  }


}
