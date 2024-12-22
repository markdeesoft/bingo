import { Component, OnInit} from '@angular/core';
import {HttpClient, HttpRequest, HttpHeaders} from '@angular/common/http';
import { DomSanitizer,SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';

const httpOptions = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin':'*',
    'Authorization':'authkey',
    'userid':'1'
  })
};

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {

  title = 'Orange Bingo';
  number_loading = false;

  values: Array<any> = [];
  number_not_get: Array<any> = [];
  number_current?: number | null;

  column_headers: any = [
    '0-9',
    '10-19',
    '20-29',
    '30-39',
    '40-49',
    '50-59',
    '60-69',
    '70-79',
    '80-89',
    '90-99',
  ];
  columns: any = [0,1,2,3,4,5,6,7,8,9];
  rows: any = [0,1,2,3,4,5,6,7,8,9];
  number_max = 99;


  finish = false;

  iframe_url: SafeUrl = '';
  url: string = '';

  td_style: any = [];
  td_class: any = [];

  history_limit = 5;
  number_histories: Array<number> = [];
  last_key!: number;

  constructor(
    // private http: HttpClient,
    // @Optional() config: ApiConfig,
    private storage: LocalStorageService,
    private http: HttpClient,
    public sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit(): void {
    if( this.storage.get("bingo") === null ){
      this.setLocalStorge();
    }else{
      if( this.storage.get("bingo") ){
        this.values = JSON.parse(this.storage.get("bingo"));
      }
      if( this.storage.get("number_current") ){
        this.number_current = this.storage.get("number_current");
      }
      if( this.storage.get("number_histories") ){
        this.number_histories = JSON.parse(this.storage.get("number_histories"));
      }
    }

    this.values.forEach( (obj: any,key: number) => {
      if( obj.status!=true ) {
        this.number_not_get.push(obj.number);
        this.td_class[key] = '';
      }
    });
  }

  public getHeaders(): HttpHeaders {
    let headers: HttpHeaders;
    headers = new HttpHeaders()
      // .set('Authorization', this.getAuthorization())
      // .set('Content-Type', 'application/json');
    ;

    headers.append('Access-Control-Allow-Headers', 'Content-Type');
    headers.append('Access-Control-Allow-Methods', 'GET');
    headers.append('Access-Control-Allow-Origin', '*');

    return headers;
  }

  getCurrentNumber(){
    if( this.number_not_get.length>0 ) {

      this.number_loading = true;

      this.td_class[this.last_key] = '';
      if( this.number_current || this.number_current===0 ) {
        this.number_histories.push(this.number_current);
        if( this.number_histories.length > this.history_limit ){
          this.number_histories.shift();
        }
      }

      // this.url = 'https://translate.google.com.vn/translate_tts?ie=UTF-8&q=หมายเลข&tl=th&client=tw-ob';
      // this.url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=th-TH&client=tw-ob&q=หมายเลข';
      // this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

      var timer = setInterval(()=>{
        this.number_current = this.number_not_get[Math.floor(Math.random()*(this.number_not_get.length-1))];
        // this.number_current = this.number_not_get[this.randomIntFromInterval(0,this.number_not_get.length)];
      }, 50);

      setTimeout(()=>{
        this.number_loading = false;
        clearInterval(timer);

        this.number_current = this.rendomNumber(this.number_not_get);

        // var text = this.number_current;
        // this.url = "https://translate.google.com.vn/translate_tts?ie=UTF-8&q="+text+"&tl=th&client=tw-ob";
     
        // this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
        // setTimeout(()=>{
        //   this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
        // },2000);

        if( this.number_current || this.number_current===0 ) {
          this.values[(this.number_current)].status = true;
        }
        this.storage.set('number_current', this.number_current);
        this.storage.set('number_histories', JSON.stringify(this.number_histories));
        this.storage.set('bingo', JSON.stringify(this.values));

      },1300);

      // this.number_loading = false;
    }else{
      this.finish = true;
    }
  }

  rendomNumber(items: Array<any>){
    var number = items[Math.floor(Math.random()*(items.length-1))];
    // var number = this.randomIntFromInterval(0,items.length)
    var index = items.indexOf(number);
    if (index > -1) {
      this.number_not_get.splice(index, 1);
    }
    this.td_class[(number)] = 'bg-green-500 text-white';
    this.last_key = number;

    return number;
  }

  setLocalStorge(){

    for(let i=0;i<=this.number_max;i++){
      var value = {
        number: i,
        status: false,
      };
      this.td_class[i] = '';
      this.values[i] = value;
      this.number_not_get.push(i);
    }

    this.storage.set('bingo', JSON.stringify(this.values));

    this.storage.set('number_current', this.number_current);
    this.storage.set('number_histories', JSON.stringify(this.number_histories));
  }

  reset(){
    if (window.confirm('แน่ใจเหรอ !!!')) {

      this.finish = false;
      this.number_current = null;
      this.values = [];
      this.number_not_get = [];
      this.number_histories = [];

      this.setLocalStorge();
    }
  }

  textToSpeech(text: string) : void {

    //get the iframe
    var iFrame = document.getElementById('ttsiframe');

    if(iFrame){
      //remove its sandbox property
      // iFrame.removeAttribute('sandbox');

      // //this is your reference variable for the iframe body and head tag
      // var iFrameBody;

      // //get the body
      // if (iFrame.contentDocument) { // FF
      //     iFrameBody = iFrame.contentDocument.getElementsByTagName('body')[0];
      //     iFrameHead = iFrame.contentDocument.getElementsByTagName('head')[0];
      // }
      // else if (iFrame.contentWindow) { // IE
      //     iFrameBody = iFrame.contentWindow.document.getElementsByTagName('body')[0];
      //     iFrameHead = iFrame.contentWindow.document.getElementsByTagName('head')[0];
      // }
      // else {
      //     iFrameBody = iFrame.contentDocument.body;
      //     iFrameHead = iFrame.contentDocument.head;
      // }

      // //generate link to Google Translate TTS using arguments (pay attention to random version number at the end)
      // var link = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=th-TH&q=' + sentence.replace(/ /g,'+').replace(/[.]/g,'') + '&rd=' + getRandomInt(0,50000000);

      // //add embed element with our link
      // iFrameBody.innerHTML = '<embed src="' + link + '" id="TTS">';

      // //isolate iframe
      // iFrame.setAttribute('sandbox','');
    }
    
  }

  // checkNumber(number){
  //
  //   if( number==5 ){
  //     return true;
  //   }
  //   return false;
  // }

}
