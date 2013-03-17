/**
 * test data and templaes
 *
 */
var Datas = {
    templates : [
        //1 template
        "<h1>Category: {{category}}</h1>\n" +
            "<ol>\n" +
            "{# items must be non-empty for valid markup #}" +
            "{% items %}" +
            "   <li>{{ . }}</li>\n" +
            "{% / %}" +
            "\n</ol>\n",

        //2 template
        "<table>\n" +
            "{% table %}" +
            "   <tr>\n" +
            "      {% . %}" +
            "<td>{{ . }}</td>" +
            "{% / %}" +
            "\n   </tr>\n" +
            "{% / %}"+
            "</table>\n",

        //3 template
        "{# comment #}Open {{category}} with {% items %} {{ category }} item-{{.}} {% / %} bum",

        //4
        "{# comment #}Open {{category:lower:escape:trim:default(test):capitalize}} with {% items %} {{ category }} item-{{.:upper:trim:party}} {% / %} bum",
    ],

    data: [
        //1
        {
            category: " fruits name",
            items: ["Mango", "Banana ", "Orange" ]
        },

        //2
        { table : [[1,2,3], [4,5,6]] },

        //3
        { items : '' },

        //4
        {items: 'test'}
    ],

    //return data
    getData: function(id) {
        return (this.data.length<=id)?'': this.data[id];
    },

    //return template
    getTemplate: function(id) {
        return (this.templates.length<=id)?'': this.templates[id];
    },

    //show html
    prepare: function(template){
        return (template === undefined)?'': template.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
};