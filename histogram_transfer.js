function make_histogram(data,width,height) {
    var reds   = []
    var greens = []    
    var blues  = []
    
    for(var i=0;i<256;i++) {
        greens.push([]);
        blues.push([]);
        for(var j=0;j<256;j++) {
            blues[i].push([]);
        }
    }

    for(var y=0;y<height;y++) {
        for(var x=0;x<width;x++) {
            r = data[((width*y)+x)*4+channel_order[0]];
            g = data[((width*y)+x)*4+channel_order[1]];
            b = data[((width*y)+x)*4+channel_order[2]];
            reds.push(r);
            greens[r].push(g);
            blues[r][g].push(b);
        }
    }
    
    reds.sort(function(a,b){return a-b});
    for(var i=0;i<256;i++) {
        greens[i].sort(function(a,b){return a-b});
        for(var j=0;j<256;j++) {
            blues[i][j].sort(function(a,b){return a-b});
        }
    }
            
    return [reds,greens,blues];
}

function make_cdf(values) {
    cdf = [];
    for(var i=0;i<256;i++) {
        cdf.push(0);
    }
    for(var i=0;i<values.length;i++) {
        cdf[values[i]] = i/values.length;
    }
    return cdf;
}

function make_cdfs(histogram) {
    reds   = histogram[0];
    greens = histogram[1];
    blues  = histogram[2];
    cdf_r = make_cdf(reds);
    cdf_g = [];
    cdf_b = [];
    for(var i=0;i<256;i++) {
        cdf_g.push(make_cdf(greens[i]));
        cdf_b.push([]);
        for(var j=0;j<256;j++) {
            cdf_b[i].push(make_cdf(blues[i][j]));
        }
    }
    return [cdf_r,cdf_g,cdf_b];
}

function transform_image(data,width,height,cdfs,histogram) {
    cdf_r = cdfs[0];
    cdf_g = cdfs[1];
    cdf_b = cdfs[2];
    reds   = histogram[0];
    greens = histogram[1];
    blues  = histogram[2];
    for(var y=0;y<height;y++) {
        for(var x=0;x<width;x++) {
            r = data[((width*y)+x)*4+channel_order[0]];
            g = data[((width*y)+x)*4+channel_order[1]];
            b = data[((width*y)+x)*4+channel_order[2]];
            nr = reds[Math.floor(cdf_r[r]*reds.length)];
            ng = greens[nr][Math.floor(cdf_g[r][g]*greens[nr].length)];
            nb = blues[nr][ng][Math.floor(cdf_b[r][g][b]*blues[nr][ng].length)];
            data[((width*y)+x)*4+channel_order[0]] = nr
            data[((width*y)+x)*4+channel_order[1]] = ng
            data[((width*y)+x)*4+channel_order[2]] = nb
        }
    }
}