/************************************
* Fast's JS Global Variable Dumper  *
*      Chrome Console Edition       *
************************************/
// version 2
var dumper = { };

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/
dumper.BANNED_KEYS      = ["dumper","document"]; // traversal will stop at these keys
dumper.MAX_SEARCH_DEPTH = 10;         // max recursive depth to search
dumper.IGNORE_NULL      = true;       // if true, don't print keys that are null

dumper.group = console.group          // change this to groupCollapsed if you're crashing

dumper.COLORS = {  // inspired by Wiremod's Expression 2 Language in Garry's Mod
    string:    "color: #999999;",
    number:    "color: #ff6666;",
    bigint:    "color: #660000;",
    boolean:   "color: #668cff;",
    symbol:    "color: #80ff80;",
    object:    "color: #fbfb51;",
    undefined: "color: #000000;",
    function:  "color: #fc83fc;"
}


dumper.justify = function(string,value){ return string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4))) } // aligns text

dumper.isBannedKey = function(key){
    if( key == "dumper" ){ return true; }
    if( dumper.BANNED_KEYS.includes(key) ){ 
        return true;
    }
    return false;
}

// call this on any value and leave location blank to print advanced data about it
dumper.advLog = function(value,path){
    if( value==null || !dumper.IGNORE_NULL ){ return } // nothing to see here...
    let type = typeof(value);
    try{
        if( type == 'symbol' ){ value = value.valueOf() } // ugh
        else if( type == 'string' ){ value = `"${value}"`}
        value+"";
    }
    catch(e){ value = "" }
    if(path){
        console.log( `${path} = %c${type} %c${value}`, "color: #ff944d;", dumper.COLORS[type] )
    }
    else{
        console.log( `%c${type} %c${value}`, "color: #ff944d;", dumper.COLORS[type] )
    }
}

dumper.recurse = function(obj, path, depth=0, relpath=path, refs=new WeakSet()) {    

    if( depth > dumper.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if(refs.has(obj)){ dumper.advLog(obj,dumper.justify(path,32)); return; }
    else if( obj!=null ){ refs.add(obj); }

    let group = depth > 0;
    for (const key in obj) {
        
        let value = obj[key];
        if( value == window ){ continue; }
        let type = typeof(value)
        let newpath = `${path}['${key}']`;
        if( group ){ group = false; dumper.group(relpath); }

        switch(type){
            case 'function':
                dumper.advLog(value,dumper.justify(newpath,32));
            case 'object':
                if( dumper.isBannedKey(key) ){ continue; }
                try{
                    dumper.recurse(value, newpath, depth+1, key, refs);  
                }
                finally{ }
            break;
            default:
                dumper.advLog(value,dumper.justify(newpath,32));
            break;
        }

    }
    if( !group ){
        console.groupEnd();
    }
    else{
        dumper.advLog(obj,dumper.justify(path,32))
    }
}
dumper.recurse(window, "window");