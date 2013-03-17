jTempla
========

javascript small template

Syntax
========

* Vars: <pre>{{ keyname }}</pre>
* Cycle: <pre>{% keyname %} {{.}} {% / %}</pre>
<pre>{{.}} - value of array </pre>
* Comments: <pre>{# comment #}</pr>

### Filters:
<pre>{{ keyname:filter1:filter2:...:filterN }}</pre>

### Exist filters:
* lower
* upper
* escape
* trim
* capitalize
* party

### Default Filter:
<pre>{{ keyname:default(test) }}</pre>

if no keyname in data, keyname value replace by "test"


Example 1.
=========
<pre>
var template = "&lt;h1&gt;Category: {{category}}&lt;/h1&gt;\n" +
"&lt;ol&gt;\n" +
"{# items must be non-empty for valid markup #}" + 
"{% items %}" +
"   &lt;li&gt;{{ . }}&lt;/li&gt;\n" +
"{% / %}" +
"&lt;/ol&gt;\n";

var result = render(template, {
   category: "Fruits",
   items: ["Mango", "Banana", "Orange" ]
});
</pre>

### Result
<pre>
&lt;h1&gt;Category: Fruits&lt;/h1&gt;
&lt;ol>
   &lt;li&gt;Mango&lt;/li&gt;
   &lt;li&gt;Banana&lt;/li&gt;
   &lt;li&gt;Orange&lt;/li&gt;
&lt;/ol&gt;
</pre>


Example 2.
=========
<pre>
var template = "&lt;table&gt;\n" +
"{% table %}" +
"   &lt;tr&gt;\n" +
"      {% . %}" +
"&lt;td&gt;{{ . }}&lt;/td&gt;" +
"{% / %}" +
"\n   &lt;/tr&gt;\n" +
"{% / %}"+
"&lt;/table&gt;\n";

var data = { table : [[1,2,3], [4,5,6]] };

var result = render(template, data);
</pre>

### Result
<pre>
&lt;table&gt;
   &lt;tr&gt;
      &lt;td&gt;1&lt;/td&gt;&lt;td&gt;2&lt;/td&gt;&lt;td&gt;3&lt;/td&gt;
   &lt;/tr&gt;
   &lt;tr&gt;
      &lt;td&gt;4&lt;/td&gt;&lt;td&gt;5&lt;/td&gt;&lt;td&gt;6&lt;/td&gt;
   &lt;/tr&gt;
&lt;/table&gt;
</pre>
