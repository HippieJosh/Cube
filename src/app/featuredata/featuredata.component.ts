import { Component, Input } from '@angular/core';
import { MyCubeField, MyCubeConfig, MyCubeComment } from "../../_models/layer.model"
import { SQLService } from "../../_services/sql.service"
import { MyCubeService } from "../map/services/mycube.service"
import { WMSService } from '../map/services/wms.service'
import { FormControl } from '@angular/forms';
import {  } from '@angular/forms';
import { MapConfig } from 'app/map/models/map.model';
import { Subscription } from 'rxjs/Subscription';
var Autolinker = require( 'autolinker' );


@Component({
    moduleId: module.id,
    selector: 'featuredata',
    templateUrl: './featuredata.component.html',
    styleUrls: ['featuredata.component.scss']
})
export class FeatureDataComponent {
    public serializedDate = new FormControl((new Date()).toISOString());
    public newComment = new MyCubeComment()
    public userID: number;
    public open: boolean;
    public showAuto: boolean = false;
    public commentText: string
    public formattedText: string
    public Autolinker = new Autolinker()
    public editCube: MyCubeField
    public myCubeData: MyCubeField[]
    public myCubeConfig: MyCubeConfig;
    public myCubeComments: MyCubeComment[]
    public subscription: Subscription
    public message: string;
    private myCubeSubscription: Subscription;
    private myCubeCommentSubscription: Subscription;
    private editSubscription: Subscription;


    constructor(private sqlservice: SQLService, private myCubeService: MyCubeService, private wmsService: WMSService) {
        // subscribe to map component messages
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.subscription = this.myCubeService.getWMS().subscribe(message => { this.message = message; this.myCubeData = null });
        this.myCubeSubscription = this.myCubeService.getMyCubeData().subscribe(myCubeData => { this.myCubeData = myCubeData; this.message = null });
        this.myCubeCommentSubscription = this.myCubeService.getMyCubeComments().subscribe(myCubeComments => { this.myCubeComments = myCubeComments })
        this.editSubscription = this.myCubeService.getMyCubeConfig().subscribe(data => { this.myCubeConfig = data });
        
    }

    @Input() canEdit: boolean;
    @Input() mapConfig: MapConfig

    ngOnInit() {
        this.open = true
        this.myCubeData = this.mapConfig.myCubeData
        this.myCubeConfig = this.mapConfig.myCubeConfig
        this.myCubeComments = this.mapConfig.myCubeComment
    }

    private clearMyCubeData(): void {
        this.myCubeData = null
    }

    private clearMessage(): void {
        this.message = null
    }

    private updateMyCube(mycube: MyCubeField): void {
        if (mycube.changed) {
            if (mycube.type == "date") {
                mycube.value = mycube.value.toJSON()
            }
            if (mycube.type == "text") {
                let ntext: RegExp = /'/g
                mycube.value = mycube.value.replace(ntext, "''")
            }
            this.sqlservice
                .Update(this.myCubeConfig.table, this.myCubeData[0].value, mycube)
                .subscribe((data) => {
                    this.myCubeService.createAutoMyCubeComment(true, mycube.field + " changed to " + mycube.value, this.myCubeData[0].value, this.myCubeConfig.table, this.userID)
                    .then(() => {
                        this.commentText = ""
                        this.myCubeService.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
                    })
                        })
                    if (mycube.type == "text") {
                        let ntext: RegExp = /''/g
                        mycube.value = mycube.value.replace(ntext, "'")
                    }
                }
            mycube.changed = false
        }

    private addMyCubeComment() {
        this.newComment.comment = this.commentText
        let ntext: RegExp = /'/g
        this.newComment.comment = this.newComment.comment.replace(ntext, "''")
        this.newComment.table = this.myCubeConfig.table
        this.newComment.featureID = this.myCubeData[0].value
        this.newComment.userID = this.userID
        this.newComment.auto = false
        this.myCubeComments.push(this.newComment)
        this.sqlservice
            .addCommentWithoutGeom(this.newComment)
            .subscribe((data) => {
                console.log(data)
                this.myCubeService.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
            })
        this.commentText = ""
    }

    private deleteMyCubeComment(table, comment:MyCubeComment) {
        this.myCubeComments.splice(this.myCubeComments.indexOf(comment))
        this.sqlservice
            .deleteComment(table, comment.id)
            .subscribe((result) => {
                this.myCubeService.loadComments(this.myCubeConfig.table, this.myCubeData[0].value)
            })
        
    }

    private onFileSelected(event) {
        console.log(event.target.files[0]) //This will be used for adding an image to a comment for myCube.
        //this.selectedFile = <File>event.target.files[0] //Send to the bytea data type field in comment table.
    }

}