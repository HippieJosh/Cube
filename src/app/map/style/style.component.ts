import { Component, OnInit, Input } from '@angular/core';
import { UserPageLayer } from '../../../_models/layer.model'
import { CommonModule } from '@angular/common';
import { MatButtonToggleChange } from '@angular/material';
import { MapConfig } from '../models/map.model';
import { NULL_INJECTOR } from '@angular/core/src/render3/component';
import { MapService } from '../services/map.service';
import { SQLService } from '../../../_services/sql.service';
import { MyCubeField } from '_models/layer.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { StyleService } from '../services/style.service';
import { LayerService } from '../../../_services/_layer.service';

@Component({
    selector: 'styletoolbar',
    templateUrl: './style.component.html',
    styleUrls: ['./style.component.scss']
})
export class StyleComponent implements OnInit {
    @Input() mapConfig: MapConfig;
    //style stuff
    private layer: ol.layer.Vector = null;
    public value: number
    public styleType: string
    public styleLabel: string
    public styleColumn = new MyCubeField
    public styleOperator: string
    public styleValue: string | boolean
    public columns: MyCubeField[]
    public selectedListTitle: string = "No Title"
    public selectedColor: string = '#000000'
    public operators: { value: string; viewValue: string; }[]
    colors = [
        { value: '#FF2D2D', viewValue: 'Red' },
        { value: '#FF7800', viewValue: 'Orange' },
        { value: '#F3FF00', viewValue: 'Yellow' },
        { value: '#4DFF00', viewValue: 'Green' },
        { value: '#0023FF', viewValue: 'Blue' },
        { value: '#8000FF', viewValue: 'Purple' },
        { value: '#F000FF', viewValue: 'Pink' },
        { value: '#000000', viewValue: 'Black' },
    ]
    booleanoperators = [
        { value: 'isEqual', viewValue: 'Equal' },
        { value: 'isNotEqual', viewValue: 'Not Equal' },
        { value: 'isGreaterThan', viewValue: 'Greater Than' },
        { value: 'isLessThan', viewValue: 'Less Than' },
        { value: 'contains', viewValue: 'Contains' }
    ];


    constructor(private mapService: MapService, private styleService: StyleService,
        private sqlSerivce: SQLService, private userPageLayerService: UserPageLayerService,
        private layerService: LayerService) { }

    ngOnInit() {
        try {
            if (this.mapConfig.currentLayer.style['load'].color != "" || this.mapConfig.currentLayer.style['load'].color != null) {
                this.selectedColor = this.mapConfig.currentLayer.style['load'].color
            }
        }
        catch (e) {
            console.log('No UserPageLayer Style');
        }

        try {
            if (this.mapConfig.currentLayer.style.listLabel) {
                this.selectedListTitle = this.mapConfig.currentLayer.style.listLabel
            }
        }
        catch(e) {
            this.selectedListTitle = ""
        }
        this.sqlSerivce.GetSchema(this.mapConfig.currentLayer.layerID)
            .subscribe((data) => {
                this.columns = data.slice(2, data.length)
            })
    }

    private disableCheck(): boolean {
        if ((this.styleColumn.field == "" || this.styleColumn.field == null) && (this.styleOperator == "" || this.styleOperator == null) && (this.styleColumn.value == "" || this.styleColumn.value == null)) {
            return true;
        }
        else if ((this.styleColumn.field != "" || this.styleColumn.field != null) && (this.styleOperator != "" || this.styleOperator != null) && (this.styleColumn.value != "" || this.styleColumn.value != null)) {
            return true;
        }
        else {
            return false;
        }
    }

    // closes the style menu
    private close() {
        this.mapConfig.styleShow = false
    }

    // applies the style to the map and only shows the appllicable items //not fully working
    private applyStyle() {
        // if (this.styleColumn['field'] == "" || this.styleColumn['field'] == null) {}
        // else {}
        this.mapConfig.currentLayer.style.load.color = this.selectedColor
        this.mapConfig.currentLayer.style.current.color = this.selectedColor
        this.mapConfig.currentLayer.style.listLabel = this.selectedListTitle;
        this.mapService.runInterval(this.mapConfig.currentLayer)
    }

    // Saves the current styles to the current user page
    private saveToPage(): void {
        if (!this.mapConfig.currentLayer.style) {
            this.mapConfig.currentLayer.style = this.mapConfig.currentLayer.layer.defaultStyle
        }
        this.applyStyle()
        //these lines are required because the UserPageLayer has objects in it that won't save right
        let UPLSave = new UserPageLayer
        UPLSave.ID = this.mapConfig.currentLayer.ID
        UPLSave.style = this.mapConfig.currentLayer.style
        this.userPageLayerService
            .Update(UPLSave)
            .subscribe((data) => {
                console.log(data)
            })
    }

    // saves the current style to the layer for everyone to view and edit (if they don't already have a style)
    private saveToLayer(): void {
        this.mapConfig.currentLayer.layer.defaultStyle = this.mapConfig.currentLayer.style;
        this.layerService
            .Update(this.mapConfig.currentLayer.layer)
            .subscribe((data) => {
                console.log(data)
            })
    }
}
