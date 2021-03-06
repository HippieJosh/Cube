import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { Configuration } from '../../../_api/api.constants';
import { UserPageService } from '../../../_services/_userPage.service';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { User, UserPage } from '../../../_models/user.model';
import { UserPageLayer } from '../../../_models/layer.model'
import { PagePipe } from '../../../_pipes/rowfilter2.pipe';
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { PageComponent } from './page/page.component';
import { PageConfigComponent } from './pageConfig/pageConfig.component';
import { ChangePasswordComponent } from './changePassword/changePassword.component';
import { NewUserComponent } from './newUser/newUser.component';
import { MatDialog } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { UserValidatorService } from './userValidator.service';
import { UserDetailsComponent } from '../details/userDetails/userDetails.component';
//import { UserDataSource } from './userTable/userData';

//Material Table list
//var userList: Array<User>;

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    providers: [UserService, UserPageLayerService, UserPageService, Configuration, PagePipe, NumFilterPipe],
    styleUrls: ['./user.component.scss'],
})


export class UserComponent implements OnInit {
    private objCode = 1
    private token: string;
    private userID: number;

    private user = new User;
    private newUser = new User;

    private userPage: UserPage;
    private userPages: Array<UserPage>;
    private users: Array<User>;
    //private userList: User[];

    private userColumns = ['userID', 'firstName', 'lastName', 'email', 'active', 'administrator', 'actionsColumn']
    private dataSource: any;

    constructor(private userValidator: UserValidatorService, private userService: UserService, private userPageLayerService: UserPageLayerService, private userPageService: UserPageService, private dialog: MatDialog) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUserItems();
        this.getUserPageItems();
    }

    // ngAfterViewInit() {
    // this.openPages(2,"Josh","Church")

    public getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((users: User[]) => {
                this.users = users;
                this.dataSource = users;
            });
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetAll()
            .subscribe((data: UserPage[]) => {
                this.userPages = data;
            });
    }

    private updateUser(user: User): void {
        let errorFlag = false;
        for (let x of this.users) {
            if (user.email === x.email) {
                /*This needs to restrict multiple users from having the same email address.
                errorFlag = true;
                this.clearInputs();
                alert(x.email + " is already taken.")*/
            }
        }

        if (errorFlag == false) {
            this.userService
                .Update(user)
                .subscribe(() => {
                    this.getUserItems();
                });
        }
    }

    //rename to change password, add a modal that will ask what new password should be
    private resetPassword(userID: number, password: string): void {
        this.userService
            .GetSingle(userID)
            .subscribe(result => {
                this.user = result;
                this.user.password = 'Monday01';
                this.userService
                    .Update(this.user)
                    .subscribe(() => {
                        this.getUserItems();
                    });

            });
    }

    private changePassword(userID: number): void {
        let dialogRef = this.dialog.open(ChangePasswordComponent, {
            data: { userID: userID }
        });
    }

    //Also delete all user_pages(userID) == userID, user_page_layers(userID), layer_permissions(userID)
    private deleteUser(userID: number): void {
        this.userService
            .Delete(userID)
            .subscribe(() => {
                this.getUserItems();
            });
    }

    private openPages(userID: number, firstName: string, lastName: string): void {
        const dialogRef = this.dialog.open(PageComponent, { width: "380px" });
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.firstName = firstName;
        dialogRef.componentInstance.lastName = lastName;

        dialogRef.afterClosed()
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    private openConfDel(user: User): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = user.ID;
        dialogRef.componentInstance.objName = user.firstName + ' ' + user.lastName;

        dialogRef.afterClosed()
            .subscribe(result => {
                if (result == this.objCode) {
                    this.deleteUser(user.ID);
                }
                this.getUserPageItems();
            });
    }

    private getUserPageItem(pageID: number, userID: number): void {
        let pName: string;
        this.userPageService
            .GetSingle(pageID)
            .subscribe((data: UserPage) => {
                pName = data.page;
                this.openPageConfig(pageID, userID, pName);
            });
    }

    private openPageConfig(pageID: number, userID: number, name: string): void {
        let dialogRef = this.dialog.open(PageConfigComponent, { width: "700px" });
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;

        dialogRef.afterClosed()
            .subscribe((response: UserPageLayer[]) => {
                console.log("openPageConfig afterClosed")
                if (response != null) {
                    for (let i of response) {
                        this.userPageLayerService.Update(i).subscribe();
                    }
                    this.getUserPageItems();
                }
            });
    }

    private openNewUser(): void {
        const dialogRef = this.dialog.open(NewUserComponent, { width: "380px" });//need to make this responsive
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getUserItems();
                this.getUserPageItems();
                //call userTableService method and subcribe to refresh list in userTable.
            });
    }

    private openDetails(id: number, fName: string, lName: string) {
        //open a dialog to edit the layer data
        const dialogRef = this.dialog.open(UserDetailsComponent);
        dialogRef.componentInstance.ID = id;
        dialogRef.componentInstance.name = fName + " " + lName;
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getUserItems();
                this.getUserPageItems();
            })
    }

    private boo(row) {
        row.confirmEditCreate()
        row.editing = !row.editing;
    }
}