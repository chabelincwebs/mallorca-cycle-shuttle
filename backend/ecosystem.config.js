module.exports = {
    apps: [{
      name: 'mallorca-shuttle-api',
      script: './dist/index.js',
      cwd: '/home/deploy/projects/mallorca-cycle-shuttle/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/deploy/.pm2/logs/mallorca-shuttle-api-error.log',
      out_file: '/home/deploy/.pm2/logs/mallorca-shuttle-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }]
  };
