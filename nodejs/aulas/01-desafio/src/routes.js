import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'
import { parse } from 'csv-parse'
import fs from 'node:fs/promises'
const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        id: search,
        title: search,
        description: search
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const {title, description} = req.body
      const completed_at = null
      const created_at = new Date
      const updated_at = null
    
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at,
        created_at,
        updated_at
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/upload'),
    handler: async (req, res) => {
      req.pipe(process.stdout)
      /*console.log(req.files)
      const parser = req.pipe(
        parse()
      );

      let count = 0;
      process.stdout.write('start\n');

      for await (const record of parser) {
        console.log('oi')
        process.stdout.write(`${count++} ${record.join(',')}\n`);
        // Fake asynchronous operation
        await new Promise((resolve) => setTimeout(resolve, 100));
      }*/
      
      res.writeHead(204).end('')
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      database.update('tasks', id, {
        title, 
        description,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params
      const tasks = database.select('tasks', id ? {
        id: id
      } : null)

      for (const row in tasks) {
        if (tasks[row].completed_at) {
          database.update('tasks', id, {
            completed_at: null,
            updated_at: new Date()
          })
        } else {
          database.update('tasks', id, {
            completed_at: new Date(),
            updated_at: new Date()
          })
        }
      }

      return res.writeHead(204).end()
    }
  }
]