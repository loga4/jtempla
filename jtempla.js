/**
 *  Main Template class
 */
var Template = (function(){

    var methods = {};

    //gdata
    var gdata = null;

    var tpl = '';
    var pos = 0;

    //search tags
    var tagsOpen    = [/\{\{\s*/,/\{\%\s*/];
    var tagsClose   = [/\s*\}\}/,/\s*\%\}/];

    //find first open tag
    function findOpenTag(reg)
    {
        var poses = [];
        var p = tpl.length ? tpl.length: -1;
        var min = { i: 0, p: p, l:0, m:'' };

        //find first open tag
        for(var i= 0,l=reg.length;i<l;i++){

            var m   = tpl.match(reg[i]);
            var pos = tpl.search(reg[i]);

            if(m && pos<min.p) {
                min.i = i;
                min.l = m[0].length;
                min.p = pos;
            }
        }

        return min;
    }

    //get tag info
    function getTag(reg)
    {
        var match;
        var tag = {type:'',value:''};
        var next = findOpenTag(reg);

        if(next.l>0 && next.p==0) {
            match = tpl.match(tagsClose[next.i]);
            var p = tpl.search(tagsClose[next.i]);

            tag.value = tpl.substring(next.l,p);

            if(next.i==0) {
                tag.type = 'var';
            } else if(next.i==1) {
                switch(tag.value) {
                    case '/':
                        tag.type = 'cycle_end';
                        break;

                    default:
                        tag.type = 'cycle_start';
                        break;
                }
            }

            tpl = tpl.substring(p+match[0].length)
        }

        return tag;
    }

    //get raw text until tag
    function getText(reg)
    {
        var match;
        var next = findOpenTag(reg);
        var p = next.p;

        switch (p) {
            case -1:
                match = tpl
                tpl = "";
                break;

            case 0:
                match = "";
                break;

            default:
                match   = tpl.substring(0,p);
                tpl     = tpl.substring(p);
                pos     = p;
                break;
        }

        return match;
    }

    //check data
    function isArray(data)
    {
        return Object.prototype.toString.call( data ) == '[object Array]'
    }

    //clear template for a comment
    methods.clear = function(template) {
        return template.replace(/\{\#.*\#\}/,'')
    }

    //Parse template for parts
    methods.parse = function(template)
    {
        //set template
        tpl = methods.clear(template);

        //all parts of template
        var parts = [];
        var opens = [];

        var i = 0;

        var value;

        //get parts of template until tpl eq ""
        while(tpl !== "") {

            //get raw text
            value = getText(tagsOpen);
            if(value) {
                var part = {
                    type: 'text',
                    value: value
                }
                parts.push(part);
            }

            //get tag
            var tag = getTag(tagsOpen);

            if(tag.type=='cycle_start') {
                opens.push(tag);
            } else if(tag.type=='cycle_end') {
                if(opens.length === 0) throw new Error('Unopened tag');
                var open = opens.pop();
            }

            parts.push(tag);
        }

        if(opens.length>0) throw new Error('Unclosed tag');

        return collector(parts);
    }

    //need to collect internal parts in cycles
    function collector(parts)
    {
        var tree    = [];
        var collect = tree;
        var blocks  = [];
        var p;

        for(var i= 0,l = parts.length; i<l; i++)
        {
            p = parts[i];

            switch(p.type) {

                case "cycle_start":
                    blocks.push(p);
                    collect.push(p)
                    collect = p.child = []; //create child and link to child
                    break;

                case "cycle_end":
                    var section = blocks.pop();
                    collect = blocks.length > 0 ? blocks[blocks.length - 1].child : tree; //return to tree
                    break;

                default:
                    collect.push(p); //if in cycle push to .child
                    break;
            }
        }

        return tree;
    }

    methods.getParts = function(template,data)
    {
        gdata = data;
        return methods.parse(template);
    }

    //get tag value
    function getValue(key, data)
    {
        var value = '';
        var filters = [];

        if(key.indexOf(':') != -1){
            filters = key.split(':')
            key = filters[0];
        }

        if(key === '.'){
            value= data
        } else {
            if(data[key] === undefined){
                if(gdata[key] === undefined) {
                    value = '';
                } else {
                    value = gdata[key];
                }
            } else {
                value = data[key];
            }
        }

        if(filters.length) {
            for(var i=1,l=filters.length;i<l; i++){
                var m = filters[i].match(/default\((.*?)\)/)

                if(m) {
                    if(value==='') {
                        value = m[1];
                        break;
                    }
                } else {
                    try {
                        value = methods.filters[filters[i]](value)
                    } catch (e) {
                        throw new Error('Filter "'+filters[i]+'" doesn\'t exists')
                    }

                }

            }
        }

        return value;
    }

    //filters
    methods.filters = {
        lower: function(value) {
            return value.toLowerCase();
        },

        upper: function(value) {
            return value.toUpperCase();
        },

        escape: function(value) {
            return value
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;');

        },

        trim: function(value) {
            return value.replace(/^\s+|\s+$/g, '');
        },

        capitalize: function(value) {
            return value.toLowerCase().replace(/^.|\s\S/g,function(w){return w.toUpperCase()})
        },


        //party for everybody dance! common and dance! (:
        party: function(value) {
            var str = '';
            var min = 10;
            var max = 24;

            for(var i= 0,l=value.length;i<l;i++){
                var rand = Math.floor(Math.random()*(max-min+1)+min);
                str += '<span style="font-size:'+rand+'px">'+value[i]+'</span>';
            }
            return str;
        }
    }

    //render tree
    methods.renderParts = function(parts,data)
    {
        var tpl = '';
        var p = [];
        var part;

        for(var i= 0, l=parts.length;i<l;i++)
        {
            part = parts[i];

            switch(part.type){
                case "cycle_start":

                    if (isArray(data)) {
                        for(var j= 0,lc = data.length;j<lc;j++){
                            tpl += methods.renderParts(part.child,data[j])
                        }
                    } else  {
                        if(!data[part.value] ) {
                            break;
                        } else if(typeof data[part.value] === 'string'){
                            tpl += methods.renderParts(part.child,data[part.value])
                        } else {
                            for(var j= 0,lc = data[part.value].length;j<lc;j++){
                                tpl += methods.renderParts(part.child,data[part.value][j])
                            }
                        }
                    }

                    break;


                case "var":
                    tpl += getValue(part.value,data);
                    break;

                case "text":
                    tpl +=part.value;
                    break;
            }
        }

        return tpl;
    }

    function checkData(data)
    {
        for(var key in data)
        {
            if(/[^a-zA-Z0-9_]/.test(key)){
                  throw new Error('Invalid key name in data')
            }
        }

        gdata = data;

        return true;
    }

    methods.getTpl = function(template, data){

        //check data
        checkData(data)

        var parts = methods.getParts(template,data);

        //return
        return methods.renderParts(parts,gdata);
    }

    return methods;
}());



function render(template, data)
{
    var tpl = Template.getTpl(template,data);

    return tpl;
}



