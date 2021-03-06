import { Component, OnInit, Input } from '@angular/core';
import { Server } from '../../../../_models/server.model';
import { User, Notif } from '../../../../_models/user.model';
import { MatDialog } from '@angular/material';
import { NotifService } from '../../../../_services/notification.service';
import { ServerService } from '../../../../_services/_server.service';
import { UserService } from '../../../../_services/_user.service';

@Component({
    selector: 'serverDetails',
    templateUrl: './serverDetails.component.html',
    styleUrls: ['./serverDetails.component.scss']
})

export class ServerDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    private user = new User;
    private server = new Server;
    private serverProps = new Array<any>();
    private changedServerProps = new Array<any>();
    private originalServerProps = new Array<any>();
    private style: string;
    private token;
    private userID;

    constructor(private dialog: MatDialog, private serverService: ServerService, private userService: UserService, private notificationService: NotifService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUser(this.userID)
        this.getServer(this.ID)
    }

    private getUser(id) {
        this.userService
            .GetSingle(id)
            .subscribe((res: User) => {
                this.user = res
            })
    }

    private getServer(id) {
        this.serverService
            .GetSingle(id)
            .subscribe((res: Server) => {
                this.server = res
            })
    }

    private submit(server) {
        this.serverService
            .Update(server)
            .subscribe(() => this.dialog.closeAll())
    }

    // private submit(layer) {
    //     this.whichFieldsChanged(layer)
    //     var notif: Notif = this.createLayerNotif(layer)
    //     this.serverService
    //         .Update(layer)
    //         .subscribe(() => {
    //             this.layerPermissionService.GetByLayer(layer.ID).subscribe((perms) => {
    //                 for(let perm of perms) {
    //                     if(perm.userID != this.userID) {
    //                         notif.userID = perm.userID;
    //                         this.notificationService
    //                             .Add(notif)
    //                             .subscribe((res) => {
    //                                 console.log(res)
    //                                 this.dialog.closeAll()
    //                             })
    //                     }
    //                 }
    //             })
    //         })
    // }

    private whichFieldsChanged(changed: Server) {
        let ix = 0;

        for (let property in changed) {
            if (changed.hasOwnProperty(property)) {
                if (changed[property] != this.serverProps[ix]) {
                    this.originalServerProps.push(this.serverProps[ix])
                    this.changedServerProps.push(changed[property])
                }
            }
            ix += 1;
        }
    }

    private createLayerNotif(S: Server): any {
        var N = new Notif;
        N.name = S.serverName + ' changed by ' + this.user.firstName + " " + this.user.lastName;
        N.description = this.parseDescription(this.originalServerProps, this.changedServerProps);
        N.priority = 3;
        N.read = false;
        N.objectType = "Server";
        N.sourceID = S.ID;

        return N;
    }

    private parseDescription(oArr, cArr): string {
        var description = "";
        let flag = false;
        let ix = 0;
        for (let prop of oArr) {
            description += "\"" + prop + "\" was changed to \"" + cArr[ix] + "\"\n"
        }
        return description;
    }

}
