export class NotificationType {
  public data: any[];
  public messageCount: number;
  constructor(private count: number) {
    this.messageCount = this.count; // AI changed: Moved initialization from property declaration to constructor to fix property access before initialization
    this.data = [
      {
        name: 'NotificationItem',
        key: 'Notification-Item',
        firstitem: { messageCount: this.messageCount, messagetext: `You have ${this.messageCount} notifications`, display: true, width: 122},

        items: [
          { NotificationType: 'Price Change', notificationtText: 'Test1', Actionbutton: true, buttonText: 'Take Action', display: false },
          { NotificationType: 'Feature Change', notificationtText: 'Test2', Actionbutton: true, buttonText: 'Take Action2', display: true },
          { NotificationType: 'Item Change', notificationtText: 'Test3', Actionbutton: true, buttonText: 'Take Action', display: false },
          { NotificationType: 'Calender Change', notificationtText: 'Test4', Actionbutton: true, buttonText: 'Take Action', display: false },
          { NotificationType: 'AP Change', notificationtText: 'Test5', Actionbutton: true, buttonText: 'Take Action', display: false },
        ],

        archivedItem: [],
        collapse: false,
        display: true
      }
    ];
  }
}

export class NotificationListModel {
  public NewCount: number = 0;
  public Notification: NotificationModel[] = [];
}

export class NotificationModel {
  public NewCount: string = '';
  public TYPE: string = '';
  public PPGS: PPGModel[] = [];
}

export class PPGModel {
  public PPG: string = '';
  public FISCAL_WEEK: string = '';
  public PPG_DESC: string = '';
  public NEW_PRICE: string = '';
  public OLD_PRICE: string = '';
  public DATE: string = '';
  public ACTION: string = '';
  public CustomerName: string = '';
  public ActionButton: boolean = true;
  public buttonText1: string = 'View';
  public buttonText2: string = 'Dismiss';
  public icon: string = 'money';
  public NotificationText: string = `The List Price / Case for the ${this.PPG_DESC} ${this.OLD_PRICE} PPG for ${this.CustomerName} customer plan has been updated from ${this.NEW_PRICE} to ${this.OLD_PRICE}; this means that all planning related data associated to this PPG has been updated in Compass.`
}