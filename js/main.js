var rf = require("fs");
var Converter = require("csvtojson").Converter;
var HashMap = require('HashMap');
var ArrayList = require('ArrayList');
var readline = require('readline-sync');
function insurance(str,x,y){
	this.insName = str;
	this.pIns=y;
	this.cIns=x;
}
function taxInfo(x,y){
	this.rank=x;
	this.percent=y;
}
function empInfo(str){
	var list = str.split(',');
	this.name=list[0];
	this.sal = parseFloat(list[1]);
	this.rank=list[2];
	this.house=parseFloat(list[3]);
}
// 读取平均工资信息
var data =rf.readFileSync('本市职工月平均工资.csv','utf-8');
var str = data.toString().split('\n');
var avgSal =parseInt(str[1]);

//读取绩效工资标准
data =rf.readFileSync('绩效工资标准.csv','utf-8');
var lines = data.toString().split('\n');
var line1 = lines[0].split(',');
var line2 = lines[1].split(',');
var map = new HashMap();
for (var i =0 ;  i< line1.length; i++)
	map.set(line1[i],parseInt(line2[i]));
//console.log(map);


//读取保险信息
var ins = new ArrayList();
data =rf.readFileSync('五险费率.csv','utf-8');
lines = data.toString().split('\n');
line1 = lines[0].split(',');
line2 = lines[1].split(',');
var line3 = lines[2].split(',');
var t;
for (var i =1; i<line1.length;i++){
	t = new insurance(line1[i],parseFloat(line2[i]),parseFloat(line3[i]));
	ins.add(t);
}
//console.log(ins);

//读取个税税率信息
data =rf.readFileSync('个税税率.csv','utf-8');
lines = data.toString().split('\n');
line1 = lines[0].split(',');
line2 = lines[1].split(',');
var t;
var incomeTax = new ArrayList();
for (var i=0; i<line1.length;i++){
	t = new taxInfo(parseInt(line1[i]),parseFloat(line2[i]));
	incomeTax.add(t);
}
//console.log(incomeTax);

//询问是否从文件中读取员工信息，或者是从键盘输入
var ch = readline.question('是否从员工名单读取信息？（y/n）');
var employee = new ArrayList();
if (ch =='y'){//送员工名单中读取
data =rf.readFileSync('员工名单.csv','utf-8');
lines = data.toString().split('\n');
var t;
for (var i=1;i<lines.length;i++){
	t = new empInfo(lines[i]);
	employee.add(t);
}
}
else{//从键盘读入
	var n =readline.question('有多少位员工？');
	for (var i = 0; i< n; i++)
		ch = readline.question('请输入员工信息？（姓名,基本工资,绩效评分,公积金）');
	    console.log(ch);
	    var t =new empInfo(ch.toString());
	    //console.log(t);
	    employee.add(t);
}
//处理员工工资单明细
for (var k =0; k<employee.size();k++){
	var x,y;
	var sumx=0,sumy=0;
	var maxSal= avgSal*3;
	var minSal= avgSal*0.6;
	var money = employee[k].sal;
	if (money>maxSal) money = maxSal;
	if (money<minSal) money = minSal;
	var ret = ' ,'+ employee[k].name+",公司\n";
	for (var i =0;i<ins.size();i++){
		x = money*ins.get(i).pIns;
		x = parseInt(x*100)/100;
		//console.log(x);
		sumx+=x;
		y=money*ins.get(i).cIns;
		y = parseInt(y*100)/100;
		sumy+=y;
		ret+= ins.get(i).insName+','+x.toFixed(2)+','+y.toFixed(2)+'\n';
	}
	x = parseInt(money*employee[k].house*100)/100;
	sumx+=x;
	sumy+=x;
	sumx=parseInt(sumx*100)/100;
	sumy=parseInt(sumy*100)/100;
	ret+='住房公积金,'+ x.toFixed(2)+','+x.toFixed(2)+'\n';
	ret+='总计,'+sumx.toFixed(2)+','+sumy.toFixed(2)+'\n';
	ret+='姓名,岗位工资,绩效工资,五险一金（个人),五险一金（单位),税前收入,扣税,税后收入\n';
	var bmoney = employee[k].sal-sumx+map.get(employee[k].rank);
	//console.log(employee[k].sal);
	var temp = bmoney-3500;
	var tax =0;
	var y;
	for (var i=incomeTax.size()-1;i>=0;i--){
		if (temp>incomeTax.get(i).rank){
			y = temp - incomeTax.get(i).rank;
			tax+= y*incomeTax.get(i).percent;
			temp-=y;
		}
	}
	tax=parseInt(tax*100)/100;
	var amoney = bmoney-tax;
	ret+= employee[k].name+','+employee[k].sal+','+map.get(employee[k].rank)+','+sumx.toFixed(2)+','+sumy.toFixed(2)+','+bmoney.toFixed(2)+','+tax.toFixed(2)+','+amoney.toFixed(2)+'\n';
	console.log(ret);
	var str = employee[k].name+'.csv';
	rf.writeFile(str,ret,function(err){
		if (err){
			return console.log(err);
		}
	});
}
