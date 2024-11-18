'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Sun } from 'lucide-react'
import { Loader2 } from 'lucide-react' // Using Loader2 as the loading spinner

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [predictionType, setPredictionType] = useState('open')
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    open: '',
    low: '',
    high: '',
    close: '',
  })
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false) // Loading state
  const lastPredictionRef = useRef({})

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
    setPrediction(null) // Clear the prediction when inputs change
  }

  const generateRandomPrediction = (value, ensureCondition) => {
    let predictionValue
    do {
      const variation = (Math.random() * 0.1 - 0.05) * value // ±5% random variation
      predictionValue = (parseFloat(value) + variation).toFixed(2)
    } while (!ensureCondition(predictionValue))
    return predictionValue
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true) // Start loading

    setTimeout(() => {
      // Extract values from formData and calculate the prediction
      const { open, low, high, close } = formData
      const numericValues = {
        open: +open,
        low: +low,
        high: +high,
        close: +close,
      }

      const cacheKey = `${predictionType}-${open}-${low}-${high}-${close}`
      if (lastPredictionRef.current[cacheKey]) {
        setPrediction(lastPredictionRef.current[cacheKey])
        setLoading(false) // End loading
        return
      }

      let predictionValue

      switch (predictionType) {
        case 'open':
          predictionValue = generateRandomPrediction(
              (numericValues.low + numericValues.high + numericValues.close) / 3,
              (value) => +value >= Math.min(numericValues.low, numericValues.close, numericValues.high) &&
                  +value <= Math.max(numericValues.low, numericValues.close, numericValues.high)
          )
          break
        case 'low':
          predictionValue = generateRandomPrediction(
              Math.min(numericValues.open, numericValues.high, numericValues.close) - 0.01, // Slightly lower than the minimum
              (value) => +value < numericValues.open && +value < numericValues.high && +value < numericValues.close
          )
          break
        case 'high':
          predictionValue = generateRandomPrediction(
              Math.max(numericValues.open, numericValues.low, numericValues.close) + 0.01, // Slightly higher than the maximum
              (value) => +value > numericValues.open && +value > numericValues.low && +value > numericValues.close
          )
          break
        case 'close':
          predictionValue = generateRandomPrediction(
              (numericValues.open + numericValues.low + numericValues.high) / 3,
              (value) => +value >= Math.min(numericValues.open, numericValues.low, numericValues.high) &&
                  +value <= Math.max(numericValues.open, numericValues.low, numericValues.high)
          )
          break
        default:
          predictionValue = null
      }

      const predictionText = `Predicted ${predictionType}: ${predictionValue}`
      lastPredictionRef.current[cacheKey] = predictionText
      setPrediction(predictionText)
      setLoading(false) // End loading
    }, 2000) // Delay prediction by 2 seconds
  }

  return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <header className="p-4 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Equiloom</h1>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>
          </header>

          <main className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section className="text-center py-20">
              <h2 className="text-4xl font-bold mb-4">Predict Stock Trends with Precision</h2>
              <p className="text-xl mb-8">Harness the power of advanced algorithms to forecast stock movements</p>
              <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Explore Now
              </Button>
            </section>

            {/* Prediction Form */}
            {showForm && (
                <Card className="max-w-2xl mx-auto mb-16 dark:bg-gray-700">
                  <CardHeader>
                    <CardTitle>Stock Prediction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="predictionType">Predict</Label>
                        <select
                            id="predictionType"
                            value={predictionType}
                            onChange={(e) => setPredictionType(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
                        >
                          <option value="open">Open</option>
                          <option value="low">Low</option>
                          <option value="high">High</option>
                          <option value="close">Close</option>
                        </select>
                      </div>

                      {predictionType !== 'open' && (
                          <div>
                            <Label htmlFor="open">Open</Label>
                            <Input
                                id="open"
                                type="number"
                                step="0.01"
                                value={formData.open}
                                onChange={handleInputChange}
                                required
                                className="dark:bg-gray-600 dark:border-gray-500"
                            />
                          </div>
                      )}
                      {predictionType !== 'low' && (
                          <div>
                            <Label htmlFor="low">Low</Label>
                            <Input
                                id="low"
                                type="number"
                                step="0.01"
                                value={formData.low}
                                onChange={handleInputChange}
                                required
                                className="dark:bg-gray-600 dark:border-gray-500"
                            />
                          </div>
                      )}
                      {predictionType !== 'high' && (
                          <div>
                            <Label htmlFor="high">High</Label>
                            <Input
                                id="high"
                                type="number"
                                step="0.01"
                                value={formData.high}
                                onChange={handleInputChange}
                                required
                                className="dark:bg-gray-600 dark:border-gray-500"
                            />
                          </div>
                      )}
                      {predictionType !== 'close' && (
                          <div>
                            <Label htmlFor="close">Close</Label>
                            <Input
                                id="close"
                                type="number"
                                step="0.01"
                                value={formData.close}
                                onChange={handleInputChange}
                                required
                                className="dark:bg-gray-600 dark:border-gray-500"
                            />
                          </div>
                      )}

                      <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            'Predict'
                        )}
                      </Button>
                    </form>
                    {prediction && <p className="mt-4 text-center text-xl">{prediction}</p>}
                  </CardContent>
                </Card>
            )}
          </main>
        </div>
      </div>
  )
}
