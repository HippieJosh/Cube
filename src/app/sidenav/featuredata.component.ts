import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SidenavService } from "../../_services/sidenav.service"

@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss'],
    providers: [SidenavService]
})
export class FeatureDataComponent{ 
    constructor(private sidenavService: SidenavService){
         // subscribe to map component messages
    }
    @Input() message: any;

    ngOnInit() {}

    public hideMenu() {
        this.sidenavService.toggleHidden();
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("place-input").style.left = "15px";
        document.getElementById("goto").style.left = "15px";
        document.getElementById("add-marker").style.left = "30px";
        document.getElementById("remove-marker").style.left = "70px";
    }

    drawLineClick() {

    }

    drawPointClick() {

    }

    drawPolygonClick() {
        
    }
}