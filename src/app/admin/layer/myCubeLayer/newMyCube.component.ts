import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { SQLService } from '../../../../_services/sql.service';
import { Layer, MyCubeField } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermissionComponent } from '../layerPermission/layerPermission.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'layer-new',
    templateUrl: './newMyCube.component.html',
    styleUrls: ['./newMyCube.component.scss'],
    providers: [UserService, Configuration, LayerService, LayerPermissionService, ServerService],
})

export class newMyCubeComponent implements OnInit {
    @Input() layerServiceField: string;
    @Input() layerIdent: string;
    @Input() layerServer: Server;
    @Input() layerFormat: string;
    @Input() layerType: string;
    @Input() layerName: string;
    private token: string;
    private userID: number;

    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog


    //if error in submission, set this to a new object (= new Layer)
    private newLayer = new Layer;
    private newLayerServer = new Server;
    private servers: Array<Server>;
    private layer = new Layer;
    public newLayerField1 = new MyCubeField
    public newLayerFields: Array<MyCubeField> = [];

    constructor(private layerservice: LayerService, private dialog: MatDialog, private serverService: ServerService, private sqlservice: SQLService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.layer.layerFormat = "None"
        this.layer.layerIdent = "None"
        this.layer.layerGeom = "None"
        this.layer.layerService = "None"
        this.layer.layerType = "MyCube"
        this.layer.serverID = 0
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    private addField() {
        this.newLayerFields.push({ field: this.newLayerField1.field, type: this.newLayerField1.type, label: this.newLayerField1.label })
    }

    private deleteField(index) {
        this.newLayerFields.splice(index, 1)
    }

    private addLayer(newlayer: Layer): void {
        this.layer.layerName = newlayer.layerName
        this.layer.layerDescription = newlayer.layerDescription
        this.layer.defaultStyle = JSON.parse('{"load":{"color":"#000000","width":2},"current":{"color":"#000000","width":4},"listLabel": "Name","filter": {}}')
        this.layerservice
    
            .Add(this.layer)
            .subscribe((result: Layer) => {
                this.createTable(result.ID);
            });
    }

    // method to update label field when one of the radio buttons is clicked

    private updateLabelField(labelField: MyCubeField): void {
        for (let tempage of this.newLayerFields) {
            if (tempage.label == true) {
                tempage.label = false;;
            }
        }
        for (let tempage of this.newLayerFields) {
            if (tempage.field == labelField.field) {
                tempage.label = true;
            }
        }
    }

    private createTable(id): void {
        this.sqlservice
            .Create(id)
            .subscribe((result: JSON) => {
                console.log('Number of Columns to Add:' + this.newLayerFields.length)
                this.newLayerFields.forEach(element => {
                    this.addColumn(id, element)
                });
                this.sqlservice
                    .setSRID(id)
                    .subscribe(() => this.dialog.closeAll());
            })
        this.sqlservice
            .CreateCommentTable(id)
            .subscribe();
        console.log("Comment Table Created")
    }

    private addColumn(id, element): void {
        this.sqlservice
            .addColumn(id, element)
            .subscribe((result: string) => {
                console.log(result)
            });
    }
}