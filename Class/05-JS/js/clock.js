function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  var grad = ctx.createRadialGradient(0, 0, radius * 0.7, 0, 0, radius);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.5, "#f3f3f3");
  grad.addColorStop(1, "#333333");

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = "#000000";
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  var num;
  var ang;
  var x;
  var y;

  ctx.font = radius * 0.15 + "px arial";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";

  for (num = 1; num <= 12; num++) {
    ang = (num * Math.PI) / 6 - Math.PI / 2;
    x = Math.cos(ang) * radius * 0.82;
    y = Math.sin(ang) * radius * 0.82;
    ctx.fillText(num.toString(), x, y);
  }
}

function drawTime(ctx, radius) {
  var now = new Date();
  var hour = now.getHours() % 12;
  var minute = now.getMinutes();
  var second = now.getSeconds();

  var hourAngle = ((hour + minute / 60 + second / 3600) * Math.PI) / 6 - Math.PI / 2;
  var minuteAngle = ((minute + second / 60) * Math.PI) / 30 - Math.PI / 2;
  var secondAngle = (second * Math.PI) / 30 - Math.PI / 2;

  drawHand(ctx, hourAngle, radius * 0.5, radius * 0.07);
  drawHand(ctx, minuteAngle, radius * 0.75, radius * 0.05);
  drawHand(ctx, secondAngle, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.rotate(pos);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.restore();
}
