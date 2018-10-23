import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'profilePic'
})
export class ProfilePicPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    var path = './../../assets/images/docter_color.png';

    console.log("Find profile pic for designation : ", value);

    if (value == 'Patient') {
      path = './../../assets/images/patient.png';
    }

    if (value == 'All Rounder') {
      path = './../../assets/images/docter_color.png';
    }

    if (value == 'General Physician') {
      path = './../../assets/images/docter_color.png';
    }

    if (value == 'Gynaecologist') {
      path = './../../assets/images/docter_color.png';
    }

    if (value == 'cardiologist') {
      path = './../../assets/images/docter_color.png';
    }

    if (value == 'Paediatrician') {
      path = './../../assets/images/docter_color.png';
    }


    return path;
  }

}
