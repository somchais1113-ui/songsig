export const trendData=[
{day:"Aug 10",signals:188},{day:"Aug 13",signals:206},{day:"Aug 16",signals:194},{day:"Aug 19",signals:240},{day:"Aug 22",signals:262},{day:"Aug 25",signals:248},{day:"Aug 28",signals:302},{day:"Aug 31",signals:289},{day:"Sep 03",signals:344},{day:"Sep 06",signals:369},{day:"Sep 09",signals:412}
];

export const topics=[
{name:"Waterproof permanence",count:418,growth:81},
{name:"Plastic adhesion",count:356,growth:52},
{name:"DIY customization",count:301,growth:37},
{name:"Outdoor marking",count:228,growth:29},
{name:"Replacement nib",count:162,growth:18}
];

export const opportunities=[
{id:"opp-1",name:"Waterproof permanence",score:91,volume:73,growth:81,pain:94,unmet:96,status:"Explore",note:"Consumers need confidence that marks remain visible under water and weather exposure."},
{id:"opp-2",name:"Plastic adhesion",score:87,volume:84,growth:52,pain:91,unmet:88,status:"Validate",note:"Cross-community complaints indicate poor adhesion on low-energy plastic surfaces."},
{id:"opp-3",name:"Surface confidence system",score:84,volume:67,growth:46,pain:86,unmet:93,status:"Explore",note:"Opportunity to communicate clear surface compatibility rather than only color variety."},
{id:"opp-4",name:"Replaceable nib",score:78,volume:51,growth:18,pain:76,unmet:82,status:"Watch",note:"Users frequently work around worn nibs by replacing the whole marker."},
{id:"opp-5",name:"Shoe customization",score:74,volume:59,growth:34,pain:68,unmet:79,status:"Watch",note:"Emerging use case across sneaker and art communities."}
];

export const initialSources=[
{id:"fb-diy",type:"facebook",name:"DIY Thailand",description:"Public DIY and home improvement conversations",items:4821,lastSync:"21 min ago",status:"healthy",active:true},
{id:"fb-model",type:"facebook",name:"Model Maker Thailand",description:"Model building, painting and surface finishing",items:2938,lastSync:"54 min ago",status:"healthy",active:true},
{id:"fb-bike",type:"facebook",name:"Motorcycle Custom Community",description:"Customization, outdoor marking and repair",items:1870,lastSync:"2 hr ago",status:"attention",active:true},
{id:"csv-field",type:"csv",name:"Field Research Import",description:"Manual observations and interview snippets",items:412,lastSync:"yesterday",status:"healthy",active:true},
{id:"yt-maker",type:"youtube",name:"Maker YouTube",description:"Prototype connector for creator comments",items:1360,lastSync:"3 hr ago",status:"healthy",active:false}
];

export const signals=[
{id:"SG-02184",source:"DIY Thailand",date:"2026-09-09",text:"ใช้อะไรเขียนพลาสติกแล้วไม่ลอกบ้างครับ ตัวที่ใช้อยู่ผ่านไปสองวันก็หลุด",topic:"Plastic adhesion",intent:"Product search",sentiment:"Negative",pain:"High",engagement:84,tags:["plastic","durability","marker"]},
{id:"SG-02183",source:"Model Maker Thailand",date:"2026-09-09",text:"สีสวยแต่หัวปากกาพังไว อยากได้แบบเปลี่ยนหัวได้",topic:"Replacement nib",intent:"Complaint",sentiment:"Negative",pain:"Medium",engagement:61,tags:["nib","maintenance"]},
{id:"SG-02180",source:"Motorcycle Custom Community",date:"2026-09-08",text:"มีปากกาอะไรเขียนบนชิ้นส่วนแล้วโดนฝนไม่หายไหม",topic:"Waterproof permanence",intent:"Product search",sentiment:"Neutral",pain:"High",engagement:102,tags:["waterproof","outdoor","motorcycle"]},
{id:"SG-02172",source:"DIY Thailand",date:"2026-09-08",text:"ไม่ได้ต้องการสีเพิ่ม แค่อยากรู้ว่าสีไหนใช้กับพื้นผิวอะไรแล้วอยู่จริง",topic:"Surface confidence",intent:"Evaluation",sentiment:"Neutral",pain:"High",engagement:119,tags:["surface","confidence","information"]},
{id:"SG-02161",source:"Field Research Import",date:"2026-09-07",text:"ซื้อ permanent marker มาแต่คำว่า permanent ไม่ได้บอกเลยว่าใช้กับพลาสติกชนิดนี้ได้หรือเปล่า",topic:"Surface confidence",intent:"Complaint",sentiment:"Negative",pain:"High",engagement:0,tags:["labeling","plastic","expectation"]},
{id:"SG-02144",source:"Model Maker Thailand",date:"2026-09-06",text:"ถ้ามีหัวเล็กกับหัวใหญ่ในแท่งเดียวจะสะดวกกว่ามาก",topic:"Nib system",intent:"Feature request",sentiment:"Positive",pain:"Low",engagement:43,tags:["nib","feature"]}
];

export const reviewSignals=[
{id:"r1",source:"Facebook · DIY Thailand",date:"Today 08:14",text:"ใช้อะไรเขียนพลาสติกแล้วไม่ลอกบ้างครับ ตัวที่ใช้อยู่ผ่านไปสองวันก็หลุด",tags:["plastic","durability","marker"],topic:"Plastic adhesion",intent:"Product search",sentiment:"Negative",pain:"High",confidence:94,status:"unreviewed"},
{id:"r2",source:"Facebook · Motorcycle Custom",date:"Yesterday 21:42",text:"มีปากกาอะไรเขียนบนชิ้นส่วนแล้วโดนฝนไม่หายไหม",tags:["waterproof","outdoor","motorcycle"],topic:"Waterproof permanence",intent:"Product search",sentiment:"Neutral",pain:"High",confidence:91,status:"unreviewed"},
{id:"r3",source:"Manual observation",date:"Yesterday 14:03",text:"ลูกค้าไม่ได้ถามหาสีใหม่ เขาถามว่าปากกาตัวไหนใช้กับวัสดุของเขาแล้วติดจริง",tags:["surface","confidence","retail"],topic:"Surface confidence",intent:"Evaluation",sentiment:"Neutral",pain:"Medium",confidence:87,status:"unreviewed"}
];

export const evidence=[
{quote:"ไม่ได้ต้องการสีเพิ่ม แค่อยากรู้ว่าสีไหนใช้กับพื้นผิวอะไรแล้วอยู่จริง",source:"DIY Thailand",cluster:"Surface confidence"},
{quote:"ซื้อ permanent marker มาแต่คำว่า permanent ไม่ได้บอกเลยว่าใช้กับพลาสติกชนิดนี้ได้หรือเปล่า",source:"Field Research",cluster:"Expectation gap"},
{quote:"มีปากกาอะไรเขียนบนชิ้นส่วนแล้วโดนฝนไม่หายไหม",source:"Motorcycle Custom",cluster:"Waterproof permanence"},
{quote:"สีสวยแต่หัวปากกาพังไว อยากได้แบบเปลี่ยนหัวได้",source:"Model Maker Thailand",cluster:"Maintenance"}
];

export const insights=[
{id:"IN-028",title:"Surface confidence matters more than additional color variety",strength:"Strong",evidence:126,communities:8,contradictions:17,status:"Validated",summary:"Users struggle to predict whether a marker will work on their specific material. Clear compatibility may create more value than expanding the color assortment."},
{id:"IN-024",title:"“Permanent” is interpreted as a performance promise, not an ink category",strength:"Strong",evidence:91,communities:6,contradictions:12,status:"Validated",summary:"Consumers expect the word permanent to imply water, abrasion and surface durability. Product language may be creating an expectation gap."},
{id:"IN-019",title:"Replaceable nibs may reduce perceived waste and improve lifetime value",strength:"Medium",evidence:44,communities:4,contradictions:9,status:"Watch",summary:"A smaller but recurring cluster reports discarding usable markers because the nib degrades first."}
];
