const c=$input.first().json;return c.jobs.length?c.jobs.map(j=>({json:j})):[{json:{no_jobs:true}}];
