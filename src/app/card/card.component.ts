import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

// import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, CommonModule, NgxSpinnerModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CardComponent {

  submitted: boolean = false;
  card_amount: number = 10;
  number_min: number = 0;
  number_max: number = 99;
  is_duplicade: boolean = false;
  column_amount: number = 5;
  row_amount: number = 5;

  table_datas: Array<any> = [];

  @ViewChild('pdfTable', {static: false}) pdfTable!: ElementRef;

  constructor(
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
  }

  handleEnterKeyPress(event: any): boolean {
    const tagName = event.target.tagName.toLowerCase();
    if (tagName === 'textarea') {
      return true;
    }
    return false;
  }

  randomIntFromInterval(min:number, max:number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createCard(){

    let cell_amount =  this.column_amount*this.row_amount;
    let cards = [];
    let number_max = this.number_max;
    let is_duplicade = cell_amount<=this.number_max?this.is_duplicade:true;

    let limit_over = 0;
    while(cards.length<=cell_amount){
      const number = this.randomIntFromInterval(this.number_min,number_max);
      if( is_duplicade ){
        cards.push(number);
      }else{
        if( cards.indexOf(number) == -1){
          cards.push(number);
        }
      }

      limit_over++;
      if( limit_over > 1000)break;
    }
    return cards;
  }

  submitForm(): void {

    this.table_datas = [];

    if( this.card_amount>0 && this.card_amount<=100 && this.column_amount<=5 && this.row_amount<=5){

      this.spinner.show();
      this.submitted = true;
      let card_numbers = [];

      if( this.number_min>=0 && this.number_max>=1 && this.column_amount>=2 && this.row_amount>=2 && this.number_min < this.number_max ){

        for( let i=1; i<=this.card_amount; i++){
          card_numbers.push( this.createCard() );
        }

        card_numbers.forEach(numbers => {
          let index = 0;
          let tr = [];
          for( let i=1; i<=this.row_amount; i++){
            let td = [];
            for( let i=1; i<=this.column_amount; i++){
              td.push(numbers[index]);
              index++;
            }
            tr.push({
              cols: td,
            });
          }

          this.table_datas.push({
            rows: tr,
          });
        });

        setTimeout(()=>{
          this.exportPDF();
          this.spinner.hide();
        },2000);

      }else{
        console.log('fail');
        setTimeout(()=>{
          this.spinner.hide();
        },1000);
      }
    }
  }

  exportPDF() {
    // const htmlElement = document.getElementById('pdfTable');
    const htmlElement = this.pdfTable.nativeElement;

    // html2canvas(htmlElement!).then(canvas => {

    //     console.log(canvas.height, canvas.width);

    //     var imgWidth = 190;
    //     var pageHeight = 295;
    //     var imgHeight = canvas.height * imgWidth / canvas.width;
    //     var heightLeft = imgHeight;

    //     const pageData = canvas.toDataURL('image/png');
    //     var pdf = new jsPDF('p', 'mm', "a4");
    //     var position = 10;

    //     pdf.addImage(pageData, 'PNG', 10, position, imgWidth, imgHeight);
    //     heightLeft -= pageHeight;

    //     while (heightLeft >= 0) {
    //       position = heightLeft - imgHeight;
    //       pdf.addPage();
    //       pdf.addImage(pageData, 'PNG', 10, position, imgWidth, imgHeight);
    //       heightLeft -= pageHeight;
    //     }
    //     // const contentDataURL = canvas.toDataURL('image/png');
    //     // var pageData = canvas.toDataURL("image/jpeg", 1.0)
    //     // // const pdf = new jsPDF('p','mm','a4');//.jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
    //     // const imgWidth = 190;
    //     // const imgHeight = canvas.height * imgWidth / canvas.width;
    //     // var contentHeight = canvas.height
    //     // var pageHeight = canvas.height;//(contentWidth / 585.28) *  841.89;
    //     // var leftHeight = contentHeight
    //     // var position = 10;
    //     // // var imgWidth = 585.28
    //     // // var imgHeight = canvas.height * imgWidth / canvas.width;
    //     // var pdf = new jsPDF("p", "mm", "a4")

    //     // console.log(leftHeight, pageHeight);
    //     // if (leftHeight<pageHeight) {
    //     //   pdf.addImage(pageData, "JPEG", 30, 50, imgWidth, imgHeight)
    //     // } else {
    //     //     // 分页
    //     //     while (leftHeight>0) {
    //     //         pdf.addImage(pageData, "JPEG", 10, position, imgWidth, imgHeight)
    //     //         leftHeight -= pageHeight
    //     //         position -= 841.89
    //     //         if (leftHeight>0) {
    //     //             pdf.addPage()
    //     //         }
    //     //     }
    //     // }
    //     // const position = 0;
    //     // pdf.addImage(pageData, 'PNG', 10, position, imgWidth, imgHeight);
    //     // pdf.save('card.pdf'); // Save the generated PDF
    //     window.open(pdf.output("bloburl"), "_blank");
    // });

    let jsPdf = new jsPDF('p', 'px', 'a4');
    // var width = jsPdf.internal.pageSize.getWidth();
    // var height = jsPdf.internal.pageSize.getHeight();
    const opt: any = {
      callback: function (jsPdf: any) {
          // jsPdf.save("card.pdf");
          window.open(jsPdf.output("bloburl"), "_blank");
          // to open the generated PDF in browser window
          // window.open(jsPdf.output('bloburl'));
      },
      margin: [17,10,15,10],
      autoPaging: 'text',
      html2canvas: {
          allowTaint: true,
          dpi: 300,
          letterRendering: true,
          logging: false,
          scale: 0.40,
          // quality: 0.98,
          // imgHeight = canvas.height * imgWidth / canvas.width: 1,
      }
    };
    jsPdf.html(htmlElement, opt);
  }

  handleExportPDF = async () => {
    const data = document.getElementById('pdfTable');
    const pageHeight = 295; // Set the desired height of each page in the PDF
  
    const doc = new jsPDF('p', 'mm', 'a4');
    const docWidth = doc.internal.pageSize.getWidth();
  
    let positionY = 0;
    let currentPage = 1;
  
    const addNewPage = () => {
      doc.addPage();
      positionY = 0;
      currentPage++;
    };
  
    const renderContent = (child: any) => {
      return new Promise((resolve) => {
        html2canvas(child).then((canvas) => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgHeight = (canvas.height * docWidth) / canvas.width;
  
          if (positionY + imgHeight > pageHeight) {
            addNewPage();
          }
  
          doc.addImage(imgData, 'JPEG', 0, positionY, docWidth, imgHeight);
          positionY += imgHeight;
  
          resolve(canvas);
        });
      });
    };
  
    const children = Array.from(data?data.children:[]);
  
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
  
      await renderContent(child);
    }
  
    // doc.save('Download.pdf');
    window.open(doc.output("bloburl"), "_blank");
  };
}
