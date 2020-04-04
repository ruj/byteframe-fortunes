//------------------------------------------------------------------------------ ShareFunction
/**
 * Share image
 * @param {string} shareid - id of the image to share
 * @returns {promise}
 */
imgur.shareImage = function (shareid, title) {
    var deferred = Q.defer();
    if(!shareid) {
        deferred.reject('Missing shareid');
    }
    imgur._imgurRequest('share', shareid, { "mature": 1, "title" : title } )
        .then(function (json) {
            deferred.resolve(json);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}
imgur.shareImage(json.data.id, screenshot.filename))
//------------------------------------------------------------------------------ ChangesToImgUrRequest
        case 'share':
            options.method = 'POST';
            options.uri += 'gallery/image/' + payload
            break;
  else if (operation === 'share') {
                form = r.form();
                form.append('title', extraFormParams.title);
            }
//------------------------------------------------------------------------------