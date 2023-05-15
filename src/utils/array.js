import XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { provinceAndCityData  } from 'element-china-area-data';
// 获取某个节点下所有子节点ID
export function getNodeAllChildren(node, arr){
    arr.push(node.key);
    if ( node.children && node.children.length ) {
        node.children.map(obj=>getNodeAllChildren(obj, arr))
    }
}
// 获取全国某个城市的编码值和名称
export function getCityCode(province, city){
    // 直辖市和特别行政区特殊处理
    let cityCode, cityName;
    if ( province === '110000') {
        cityCode = province;
        cityName = '北京市';
        return { cityCode, cityName };
    }
    if ( province === '120000') {
        cityCode = province;
        cityName = '天津市';
        return { cityCode, cityName };
    }
    if ( province === '310000') {
        cityCode = province;
        cityName = '上海市';
        return { cityCode, cityName };
    }
    if ( province === '500000') {
        cityCode = province;
        cityName = '重庆市';
        return { cityCode, cityName };
    }
    if ( province === '810000') {
        cityCode = province;
        cityName = '香港特别行政区';
        return { cityCode, cityName };
    }
    if ( province === '820000') {
        cityCode = province;
        cityName = '澳门特别行政区';
        return { cityCode, cityName };
    }
    provinceAndCityData.forEach((item)=>{
        if ( item.value === province ) {
            if ( item.children && item.children.length ) {
                item.children.forEach(sub=>{
                    if ( sub.value === city ) {
                        cityCode = sub.value;
                        cityName = sub.label;
                        
                    }
                })
            }
        }
    })
    return { cityCode, cityName };
}
export let attrs = [
    { subTitle:'颗粒物', key:'pm0dot3', title:'0.3um', unit:'PC/L'},
    { subTitle:'颗粒物', key:'pm0dot5', title:'0.5um', unit:'PC/L'},
    { subTitle:'颗粒物', key:'pm1dot0', title:'1.0um', unit:'PC/L'},
    { subTitle:'颗粒物', key:'pm2dot5', title:'2.5um', unit:'PC/L'},
    { subTitle:'颗粒物', key:'pm5dot0', title:'5.0um', unit:'PC/L'},
    { subTitle:'颗粒物', key:'pm10dot0', title:'10um', unit:'PC/L'},
    { subTitle:'', key:'temp', title:'温度', unit:'℃'},
    { subTitle:'', key:'humidity', title:'湿度', unit:'%'},
    { subTitle:'', key:'dewpoint', title:'露点温度', unit:'℃'},
    { subTitle:'', key:'diffPressure', title:'压差', unit:'Pa'},
    // { subTitle:'', key:'windspeed', title:'风速', unit:'m/s'}
];

export function isIncludes(parentArr, childrenArr) {
    // 当父数组为空时，认为不包含子数组的任何元素，返回false;
    if (!parentArr.length) return false;
    let tempArrLength = Array.from(new Set([...parentArr, ...childrenArr])).length
    return tempArrLength === parentArr.length || tempArrLength === childrenArr.length
}

export function selectArr(parentArr, childArr){
    // 计算parentArr 和 childArr 的交集
    let result = [];
    if(!parentArr.length) return result;
    parentArr.forEach(item=>{
        if(childArr.includes(item)) result.push(item);
    })
    return result;
}

export function findMaxAndMin(arr, decimal){
    if (!arr) return {};
    let maxInit = arr[0], minInit = arr[0], maxIndex = 0, minIndex = 0;
    let sum = 0;
    for(var i=0,len=arr.length;i<len;i++){
        sum += +arr[i];
        if ( arr[i] > maxInit ) {
            maxInit = arr[i];
            maxIndex = i;
        } else if ( arr[i] && ( arr[i] < minInit ) ){
            minInit = arr[i];
            minIndex = i;
        }
    }
    return {
        min:{
            value: decimal ? (+minInit).toFixed(2) : Math.round(minInit),
            index:minIndex
        },
        max:{
            value: decimal ? (+maxInit).toFixed(2) : Math.round(maxInit),
            index:maxIndex
        },
        avg: decimal ? (sum/arr.length).toFixed(2) : Math.round(sum/arr.length)
    }
}

export function flattern(arr, result){
    arr.forEach(item=>{
        result.push(item.key);
        if(!item.children) {
            return ;
        } else {
            flattern(item.children, result);
        }
    })
}

export function getDeep(arr, deep = 0){
    
    if ( arr.children && arr.children.length ){
        arr.children.map((item,index)=>{
            let temp = deep;
            getDeep(item, ++temp);
        })
    }
}

export function splitTimePeriod(arr){
    let rateInfo = {};
    let beginMonth;
    arr.forEach(month=>{     
        let between = month.end_month - month.begin_month + 1;
        beginMonth = Number(month.begin_month);
        for( between; between>0;between--){
            // 获取月区间的时段信息
            rateInfo[beginMonth < 10 ? '0'+beginMonth : beginMonth] = getTimeList(month.timeList);
            ++beginMonth;
        }
    });
    return rateInfo;
}

function getTimeList(arr){
    let obj = {};
    let start;
    arr.forEach(time=>{
        let between = time.end_time - time.begin_time - 1;
        start = Number(time.begin_time);
        for(between;between>=0;between--){
            obj[start < 10 ? '0'+start : start] = time.time_type;
            ++start;
        }
    });
    return obj;
}
function sheet2blob(sheet, sheetName) {
	sheetName = sheetName || 'Sheet1';
	var workbook = {
		SheetNames: [sheetName],
		Sheets:{}
	};
	workbook.Sheets[sheetName] = sheet;
	// // 生成excel的配置项
	var wopts = {
		bookType: 'xlsx', // 要生成的文件类型
		bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
		type: 'binary',
        cellStyles:true
	};
	var wbout = XLSX.write(workbook, wopts);
	var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
	// 字符串转ArrayBuffer
	function s2ab(s) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}
	return blob;
}

export function downloadExcel(sheet, fileName, merge){
    // let blob = translateDataToSheet(data, null, merge);
    let blob = sheet2blob(sheet, fileName);
    if ( typeof blob === 'object' && blob instanceof Blob ){
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = fileName || '通用excel';
        let event;
        if( window.MouseEvent) {
            event = new MouseEvent('click');
        } else {
            event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        a.dispatchEvent(event);
    }
}

let canvasWidth = 0, canvasHeight = 0;
export function getBase64(dom){
    return html2canvas(dom, { dpi:196, scale:2, backgroundColor:'#000' })
        .then(canvas=>{
            let MIME_TYPE = "image/jpeg";
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
            return canvas.toDataURL(MIME_TYPE, 1.0);
        })
}

export function downloadPDF(fileTitle, imageData){
    // 第一个参数： l：横向  p：纵向
    // 第二个参数：测量单位（"pt"，"mm", "cm", "m", "in" or "px"）
    // 第三个参数：可以是下面格式，默认为“a4”
    // var pdf = new jsPDF('p', 'px', [1612, 806]);                   
    // pdf.addImage(base64Imgs, 'JPEG', 0, 0, 1612, 806);
    // pdf.save(`ceshi.pdf`);
    // setFinishLoading(false);
    
    var contentWidth = canvasWidth;
    var contentHeight = canvasHeight;
    //一页pdf显示html页面生成的canvas高度;
    var pageHeight = contentWidth / 1190.7 * 841.89;
    //未生成pdf的html页面高度
    var leftHeight = contentHeight;
    //pdf页面偏移
    var position = 0;
    //html页面生成的canvas在pdf中图片的宽高（a4纸的尺寸[595.28,841.89]， 单位为pt）
    // a3纸的尺寸297mm * 420mm = [841.89, 1190.7] pt
    // 1pt ≈ 0.35279mm ≈ 0.353mm 
    // 1mm ≈ 2.835pt
    var imgWidth = 1190.7;
    var imgHeight = 1190.7 / contentWidth * contentHeight;
    var pdf = new jsPDF('l', 'pt', 'a3');
    if (leftHeight < pageHeight) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, pageHeight);
        pdf.addImage(canvas, 'JPEG', 0, 0, imgWidth, 841.89);
        pdf.addImage(imageData, 'JPEG', 0, 15, imgWidth, imgHeight);
    } else {
        while (leftHeight > 0) {
            pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= pageHeight;
            position -= 841.89;
            //避免添加空白页
            if (leftHeight > 0) {
                pdf.addPage();
            }
        }
    }
    pdf.save(fileTitle + '.pdf');
}