var Pulse = module.exports = function pulse(metric) {
  if (!(this instanceof Pulse)) {
    return new Pulse(metric);
  }
  var p = this;
  p._metric = metric;
  p._measureLoop();
}

Pulse.prototype._measureLoop = function _measureLoop() {
  var p = this;
  p._metric.count('health.loop.blocked', 0);
  blocked(function blockHandler(ms) {
    p._metric.count('health.loop.blocked', ms);
  });

  memory(function memHandler(heapUsed, rss) {
    p._metric.gauge('health.memory.heapUsed', heapUsed);
    p._metric.gauge('health.memory.rss', rss);
    p._metric.gauge('health.process.uptime', process.uptime());
  })
}

var blocked = function(fn) {
  var start = process.hrtime()
  var interval = 100;

  setInterval(function(){
    var delta = process.hrtime(start);
    var nanosec = delta[0] * 1e9 + delta[1];
    var ms = nanosec / 1e6;
    var n = ms - interval;
    if (n > 10) {
      fn(Math.round(n))
    }
    start = process.hrtime();
  }, interval).unref();
};

var memory = function(fn) {
  var interval = 1000;

  setInterval(function() {
    var mem = process.memoryUsage();
    fn(mem.heapUsed, mem.rss);
  })
}
