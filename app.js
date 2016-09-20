// var img = new Image();   // Create new img element

// img.addEventListener("load", function() {
//   // execute drawImage statements here
  
//   var ctx = document.getElementById('sourceCanvas').getContext('2d');
//   ctx.canvas.height = img.height;
//   ctx.canvas.width = img.width;
  
//   ctx.drawImage(img,0,0);
  
// }, false);

// img.src = 'dog.jpg'; // Set source path

////////////////////////////////////////////////////////

var app = (function(my) {
    
    my.image = new Image();
    my.fileReader = new FileReader();
    my.pixels = [];        
    
    my.elements = {
        sourceCanvas: document.getElementById("sourceCanvas")
        ,inputFile: document.getElementById('inputFile')
        ,ledPreviewCanvas: document.getElementById('ledPreviewCanvas')
        ,outputTextarea: document.getElementById('outputTextarea')
        ,ledPreviewContainer: document.getElementById('ledPreviewContainer')
        ,ledDivs: []        
    };         

    function readPixels(limit) {
        
        var output = [];
        var canvas = my.elements.sourceCanvas;    
        var ctx = canvas.getContext("2d");
        
        // Get the CanvasPixelArray from the given coordinates and dimensions.
        var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pix = imgd.data;
        
        // Loop over each pixel and invert the color.
        for (var i = 0, n = pix.length; i < n; i += 4) {
            var red   = pix[i  ]; // red
            var green = pix[i+1]; // green
            var blue  = pix[i+2]; // blue
            // i+3 is alpha (the fourth element)
            
            output.push([red,green,blue]);
            
            // if (output.length >= limit) {
            //     break;
            // }
        }    
        
        return output;
        
    }

    // print an array formatted for Arduino
    function printArray(array) {
        
        var arrayString =
             JSON.stringify(array)
                .replace(/\[/g,'{')
                 .replace(/]/g,'}');

        var code = ['int pixels[][3] = ' , arrayString , ';'].join('');
                
        my.elements.outputTextarea.value = code;
    }
    
    var ledBulbCount = 50;
    my.doAnimate = false;
    my.animateDelay = 50;
    my.startPixel = 0;
    
    function animate() {
    
        window.setTimeout(animate, my.animateDelay);    
        if (!my.doAnimate) return;
    
        my.startPixel++;
        // if (my.startPixel > my.pixels.length) 
        //     my.startPixel = 0;
            
        for(var i=0;i<ledBulbCount;i++) {
            var div = my.elements.ledDivs[i];
            var p = (my.startPixel + i) % my.pixels.length;
            var rgb = my.pixels[p];
            // "rgb(155, 102, 102)"; 
            var color = ['rgb(' ,[rgb[0], rgb[1], rgb[2]].join(','), ')'].join(''); 
            div.style.backgroundColor = color;
        }
                
    }        
    
    window.setTimeout(animate, my.animateDelay);
    
    
    (function appendLedDivs() {
        
        var containerDiv = my.elements.ledPreviewContainer;               
        
        for(var i=0;i<ledBulbCount;i++) {
            var div = document.createElement('div');
            div.setAttribute('class', 'ledBulb');
            my.elements.ledPreviewContainer.appendChild(div);
            my.elements.ledDivs.push(div);
        }
        
    })();
    
    // init the event handlers            
    (function initEventHandlers() {
        
        new TextToClipboard('#copyToClipboard', {
            target: function(trigger) {
                return trigger.nextElementSibling;
            }
        });
        
        my.pasteCallback = function () {
            
            var canvas = my.elements.sourceCanvas;            
            canvas.style.display = 'inline';

            my.pixels = readPixels(50);
            printArray(my.pixels);
            my.doAnimate = true;
            
        }
        
        new ClipboardToCanvas("sourceCanvas", true, my.pasteCallback);
        
        my.image.onload = function(e) {
        
            var canvas = my.elements.sourceCanvas;            
                        
            canvas.width = my.image.width;
            canvas.height = my.image.height;
            canvas.style.display = 'inline';
                    
            var ctx = canvas.getContext("2d");
            ctx.drawImage(my.image,0,0);
            
            my.pixels = readPixels(50);
            printArray(my.pixels);
            my.doAnimate = true;
            
        };
        
        // onload fires after reading is complete
        my.fileReader.onload = function(e) {
            my.image.src = my.fileReader.result;
        }    
        
        my.elements.inputFile.onchange = function(e) {
        
            var file = e.target.files[0];      
            // begin reading        
            my.fileReader.readAsDataURL(file); 
                            
        };

    })();
    

    return my;
    
})(app || {});





////////////////////////////////////////////////////////
