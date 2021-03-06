import { Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { Group, GroupMember } from '../../../_models/group.model';
import { GroupService } from '../../../_services/_group.service';
import { GroupMemberService } from '../../../_services/_groupMember.service';
import { NewGroupComponent } from './newGroup/newGroup.component';
import { EditGroupComponent } from './editGroup/editGroup.component'
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { MatDialog, MatDialogRef, MatSelectionList } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { from } from 'rxjs/observable/from';

@Component({
    selector: 'group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    providers: [UserService] //removed Configuration, FilterPipe, NumFilterPipe
})

export class GroupComponent implements OnInit {
    @ViewChild('groupUsers') groupSelectionList: any;
    @ViewChild('groupGroups') userSelectionList: any;

    private token: string;
    private userID: number;
    private objCode = 3;
    private type = "Group"
    private bool = false;

    private group = new Group;
    private groups: Array<Group>;
    private users: Array<User>;

    private selectedUser: User;
    private selectedAvailableUser;
    private selectedMemberUser;
    private selectedGroup: Group;
    private selectedAvailableGroup;
    private selectedMemberGroup;
    private userGroupMembers;

    private availableGroups;
    private availableUsers;
    private memberGroups;
    private memberUsers;
    private showGroup: boolean;

    constructor(private userService: UserService, private groupService: GroupService,
        private groupMemberService: GroupMemberService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getGroupItems();
        this.getUserItems();
    }

    private getGroupItems(): void {
        this.groupService
            .GetAll()
            .subscribe((data) => {
                this.groups = data;
            }, error => {
                console.error(error);
            });
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data: User[]) => {
                this.users = data;
            }, error => {
                console.error(error);
            });
    }

    private addGroup(newGroup: string): void {
        this.group.name = newGroup;
        this.groupService
            // .Add(this.group, this.token)
            .Add(this.group)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private updateGroup(group: Group): void {
        this.groupService
            .Update(group)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private openConfDel(group: Group): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objID = group.ID;
        dialogRef.componentInstance.objName = group.name;
        dialogRef.componentInstance.objCode = this.objCode;

        dialogRef.afterClosed().subscribe(result => {
            if (result == this.objCode) {
                this.deleteGroup(group.ID);
            }
            this.getGroupItems();
        });
    }

    private confDelGroup(group: Group) {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = group.ID;
        dialogRef.componentInstance.objName = group.name;

        dialogRef
            .afterClosed()
            .subscribe(result => {
                if (result == this.objCode) {
                    this.deleteGroup(group.ID);
                }
            });
    }

    private editDetails(group: Group) {
        const dialogRef = this.dialog.open(EditGroupComponent, { width: '325px' });
        dialogRef.componentInstance.group = group;
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private deleteGroup(groupID): void {
        this.groupService
            .Delete(groupID)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private openNewGroup() {
        const dialogRef = this.dialog.open(NewGroupComponent, { width: '325px' });
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private remove(arr, el) {
        const index = arr.indexOf(el);
        arr.splice(index, 1);
    }

    private selectUser(user: User): void {
        //this.groupSelectionList.deselectAll();
        this.selectedUser = user;
        this.groupMemberService
            .GetByUser(user.ID)
            .subscribe((data) => {
                this.userGroupMembers = data;
                var tempA = new Array<Group>();
                var tempB = new Array<Group>();

                for (let group of data) {
                    tempA.push(group.group);
                }

                this.memberGroups = tempA;

                // loop to compare member groups to all groups and form an array for available groups to display
                for (let group of this.groups) {
                    var counter = 0;
                    for (var i = 0; i < tempA.length; i++) {
                        if (group.name != tempA[i].name) {
                            counter++;
                        }
                    }
                    if (counter == tempA.length) {
                        tempB.push(group);
                    }
                }
                if (this.groups.length == 0) {
                    this.availableGroups = this.groups;
                }
                else {
                    this.availableGroups = tempB;
                }
            })
    }

    private selectGroup(group: Group): void {
        //this.userSelectionList.deselectAll();
        this.selectedGroup = group;
        this.groupMemberService
            .GetByGroup(group.ID)
            .subscribe((data) => {
                this.userGroupMembers = data;
                var tempA = new Array<GroupMember>();
                var tempB = new Array<User>();
                var tempC = new Array<User>();

                for (let user of data) {
                    tempA.push(user);
                }

                for (let user of this.users) {
                    var counter = 0;
                    for (var i = 0; i < tempA.length; i++) {
                        if (user.ID != tempA[i].userID) {
                            counter++;
                        }
                    }

                    if (counter == tempA.length) {
                        tempB.push(user);
                    }
                }

                if (tempA.length == 0) {
                    this.availableUsers = this.users;
                }
                else {
                    this.availableUsers = tempB;
                }

                for (let user of data) {
                    this.userService
                        .GetSingle(user.userID)
                        .subscribe((user) => {
                            tempC.push(user)
                        })
                }

                this.memberUsers = tempC;
            })
    }

    private selectUserAdd(user: User) {
        this.selectedAvailableUser = user;
    }

    private selectUserRemove(user: User) {
        this.selectedMemberUser = user;
    }

    private selectGroupAdd(group: Group) {
        this.selectedAvailableGroup = group;
        //this.selectedMemberGroup = null;
    }

    private selectGroupRemove(group: Group) {
        this.selectedMemberGroup = group;
        //this.selectedAvailableGroup = null;
    }

    private removeMemberGroup(group: Group) {
        for (let assoc of this.userGroupMembers) {
            if (assoc.groupID == group.ID) {
                this.groupMemberService
                    .Delete(assoc.ID)
                    .subscribe(() => {
                        this.getGroupItems();
                        this.getUserItems();
                        this.selectUser(this.selectedUser);
                    });
            }
        }
    }

    private removeMemberUser(user: User) {
        for (let assoc of this.userGroupMembers) {
            if (assoc.userID == user.ID) {
                this.groupMemberService
                    .Delete(assoc.ID)
                    .subscribe(() => {
                        this.getGroupItems();
                        this.getUserItems();
                        this.selectGroup(this.selectedGroup);
                    });
            }
        }
    }

    private addAvailableGroup(group: Group) {
        var flag = false;
        for (let g of this.memberGroups) {
            if (group.ID === g.ID) {
                return;
            }
        }

        let groupMember = new GroupMember;
        groupMember.groupID = group.ID;
        groupMember.userID = this.selectedUser.ID;
        this.groupMemberService
            .Add(groupMember)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
                this.selectUser(this.selectedUser);
            });
    }

    private addAvailableUser(user: User) {
        var flag = false;
        for (let u of this.memberUsers) {
            if (user.ID === u.ID) {
                return;
            }
        }

        let groupMember = new GroupMember;
        groupMember.userID = user.ID;
        groupMember.groupID = this.selectedGroup.ID;
        this.groupMemberService
            .Add(groupMember)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
                this.selectGroup(this.selectedGroup);
            });
    }

    private showme(b) {
        if (b) {
            console.log("go to users");
            this.type = "Group";
        }
        else {
            console.log("go to groups");
            this.type = "User";
        }
    }
}