import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CategoryService } from '../../../services/category.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('expensesChart') expensesChartRef!: ElementRef;
  @ViewChild('profitsChart') profitsChartRef!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef;
  @ViewChild('departmentChart') departmentChartRef!: ElementRef;

  categoryData: {}={};
  salesData = {
    value: '424,652 TND',
    label: 'Sales',
    chartData: [30, 40, 35, 50, 45, 60, 55, 65, 75, 70, 80, 65]
  };

  expensesData = {
    value: '235,312 TND',
    label: 'Expenses',
    chartData: [20, 30, 25, 40, 35, 45, 40, 50, 55, 50, 60, 45]
  };

  profitsData = {
    value: '135,965 TND',
    label: 'Profits',
    chartData: [10, 20, 15, 30, 25, 35, 30, 40, 45, 40, 50, 35]
  };

  salesChart: any;
  expensesChart: any;
  profitsChart: any;
  monthlyChart: any;
  departmentChart: any;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    // Initialize tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltip';
    tooltipContainer.className = 'absolute z-50 hidden';
    document.body.appendChild(tooltipContainer);
    this.getallcategories();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSalesChart();
      this.initExpensesChart();
      this.initProfitsChart();
      this.initMonthlyChart();
      this.initDepartmentChart();
    }, 0);
  }
  getallcategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categoryData=data;
        console.log(this.categoryData);
        this.initDepartmentChart();
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
    }
  initSalesChart(): void {
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(12).fill(''),
        datasets: [{
          data: this.salesData.chartData,
          borderColor: 'rgba(200, 200, 200, 0.8)',
          backgroundColor: 'rgba(200, 200, 200, 0.1)',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
          fill: true
        }]
      },
      options: this.getLineChartOptions()
    });
  }

  initExpensesChart(): void {
    const ctx = this.expensesChartRef.nativeElement.getContext('2d');
    this.expensesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(12).fill(''),
        datasets: [{
          data: this.expensesData.chartData,
          borderColor: 'rgba(200, 200, 200, 0.8)',
          backgroundColor: 'rgba(200, 200, 200, 0.1)',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
          fill: true
        }]
      },
      options: this.getLineChartOptions()
    });
  }

  initProfitsChart(): void {
    const ctx = this.profitsChartRef.nativeElement.getContext('2d');
    this.profitsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(12).fill(''),
        datasets: [{
          data: this.profitsData.chartData,
          borderColor: 'rgba(14, 165, 233, 0.8)',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
          fill: true
        }]
      },
      options: this.getLineChartOptions()
    });
  }

  initMonthlyChart(): void {
    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Clothing',
            data: [45, 20, 60, 60, 50, 45, 30, 25, 35, 45, 50, 55],
            backgroundColor: 'rgb(20, 184, 166)',
            barPercentage: 0.6,
            categoryPercentage: 0.8
          },
          {
            label: 'Food Products',
            data: [15, 0, 0, 5, 0, 5, 5, 10, 0, 10, 0, 5],
            backgroundColor: 'rgb(59, 130, 246)',
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              
              color: 'rgba(200, 200, 200, 0.2)'
            },
            ticks: {
              stepSize: 20
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  initDepartmentChart(): void {
    const ctx = this.departmentChartRef.nativeElement.getContext('2d');
    this.departmentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Clothing', 'Books', 'Electronics', 'Shoes ', 'Garden & Outdoor'],
        datasets: [{
          data: [35, 15, 20, 20, 10],
          backgroundColor: [
            'rgb(20, 184, 166)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  getLineChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      },
      elements: {
        line: {
          tension: 0.4
        }
      }
    };
  }

  createTooltip(event: MouseEvent, chartElement: ElementRef, date: string, label: string, value: number): void {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      const rect = chartElement.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      tooltip.style.display = 'block';
      tooltip.style.left = (event.clientX + 10) + 'px';
      tooltip.style.top = (event.clientY + 10) + 'px';
      tooltip.innerHTML = `
        <div class="bg-white p-2 rounded shadow-lg text-sm">
          <div class="text-gray-500">${date}</div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full ${label === 'Profits' ? 'bg-blue-500' : 'bg-gray-400'}"></div>
            <span>${label}: ${value}</span>
          </div>
        </div>
      `;
    }
  }

  hideTooltip(): void {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}