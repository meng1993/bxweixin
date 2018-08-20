var app=getApp();
Page({
  onLoad(e){
    let card=JSON.parse(e.card);
    card.effect_time = app.shijianchuo(card.effect_time);
    card.invalid_time = app.shijianchuo(card.invalid_time);
    this.setData({data:card});
  }
})