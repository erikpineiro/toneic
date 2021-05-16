HTMLElement.prototype.click = function (data) {
    let { callback } = data;
    this.addEventListener("click", callback);
    this.addEventListener("touchstart", function(){
        this.classList.add("active");
    });
    this.addEventListener("touchend", function(){
        this.classList.remove("active");
    });
};